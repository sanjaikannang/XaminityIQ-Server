import { Types } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AttemptStatus, ExamMode, ExamStatus, SubmissionTrigger } from 'src/utils/enum';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamAttemptRepositoryService } from 'src/repositories/exam-attempt-repository/exam-attempt.repository';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';

const SWEEP_INTERVAL_MS = 5 * 1000;
const SUBMIT_GRACE_MS = 5000;
const STUCK_SUBMITTED_GRACE_MS = 15 * 60 * 1000;

@Injectable()
export class ExamLifecycleSchedulerService {
    private readonly logger = new Logger(ExamLifecycleSchedulerService.name);

    constructor(
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examAttemptRepositoryService: ExamAttemptRepositoryService,
        private readonly examAttemptService: ExamAttemptService,
    ) { }


    @Interval(SWEEP_INTERVAL_MS)
    async runLifecycleSweep() {
        await this.sweepOverdueAttempts();
        await this.sweepStuckSubmittedAttempts();
        await this.sweepExamLifecycle();
    }


    // An IN_PROGRESS attempt whose deadline has passed with no client ever calling
    // submit again (tab closed, never returned) — force-finalize it server-side,
    // reusing the exact same scoring/finalization path a manual submit uses.
    private async sweepOverdueAttempts() {
        const inProgress = await this.examAttemptRepositoryService.findAllByStatus(AttemptStatus.IN_PROGRESS);

        for (const attempt of inProgress) {
            try {
                const exam = await this.examRepositoryService.findByIdRaw(attempt.examId.toString());
                if (!exam || !attempt.startedAt) continue;

                const deadline = new Date(attempt.startedAt).getTime() + exam.durationMinutes * 60000;
                if (Date.now() > deadline + SUBMIT_GRACE_MS) {
                    await this.examAttemptService.finalizeAttemptByFaculty(
                        (attempt._id as Types.ObjectId).toString(),
                        SubmissionTrigger.TIMER_EXPIRY,
                    );
                }
            } catch (error) {
                this.logger.error(`Failed to sweep overdue attempt ${attempt._id}: ${error.message}`);
            }
        }
    }


    // A SUBMITTED attempt whose client vanished before its recording finished
    // uploading never reaches COMPLETED on its own — force it through after a grace window.
    private async sweepStuckSubmittedAttempts() {
        const submitted = await this.examAttemptRepositoryService.findAllByStatus(AttemptStatus.SUBMITTED);

        for (const attempt of submitted) {
            try {
                if (!attempt.submittedAt) continue;
                if (Date.now() - new Date(attempt.submittedAt).getTime() > STUCK_SUBMITTED_GRACE_MS) {
                    await this.examAttemptRepositoryService.updateById(
                        (attempt._id as Types.ObjectId).toString(),
                        { status: AttemptStatus.COMPLETED },
                    );
                }
            } catch (error) {
                this.logger.error(`Failed to sweep stuck submitted attempt ${attempt._id}: ${error.message}`);
            }
        }
    }


    // PUBLISHED -> ONGOING once the exam's scheduled window opens,
    // ONGOING -> COMPLETED once it closes — independent of any individual attempt's state.
    private async sweepExamLifecycle() {
        const exams = await this.examRepositoryService.findAllByStatuses([ExamStatus.PUBLISHED, ExamStatus.ONGOING]);
        const now = Date.now();

        for (const exam of exams) {
            try {
                const { start, end } = this.getExamWindow(exam);

                if (exam.status === ExamStatus.PUBLISHED && now >= start.getTime()) {
                    await this.examRepositoryService.updateById((exam._id as Types.ObjectId).toString(), { status: ExamStatus.ONGOING } as any);
                } else if (now > end.getTime()) {
                    await this.examRepositoryService.updateById((exam._id as Types.ObjectId).toString(), { status: ExamStatus.COMPLETED } as any);
                }
            } catch (error) {
                this.logger.error(`Failed to sweep exam lifecycle for ${exam._id}: ${error.message}`);
            }
        }
    }

    private getExamWindow(exam: any): { start: Date; end: Date } {
        if (exam.mode === ExamMode.PROCTORING && exam.startTime && exam.endTime) {
            return {
                start: this.combineDateTime(exam.startDate, exam.startTime),
                end: this.combineDateTime(exam.endDate, exam.endTime),
            };
        }
        return { start: exam.startDate, end: exam.endDate };
    }

    private combineDateTime(date: Date, time: string): Date {
        const datePart = new Date(date).toISOString().split('T')[0];
        return new Date(`${datePart}T${time}:00`);
    }

}
