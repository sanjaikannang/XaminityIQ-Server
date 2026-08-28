import { Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { RoomAssignmentStatus, SubmissionTrigger } from 'src/utils/enum';
import { combineDateTimeIST } from 'src/utils/date.util';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamRoomAssignmentRepositoryService } from 'src/repositories/exam-room-assignment-repository/exam-room-assignment.repository';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';

const DEFAULT_GRACE_MINUTES = 2;

// Runs every minute: for each student mid-disconnect (see LiveKitWebhookService),
// once the exam's connectionLossGracePeriodMinutes has elapsed without a
// reconnect, either (a) flip them to DISCONNECTED — non-terminal, they can
// rejoin the lobby and be re-admitted — or (b) if the exam's own scheduled
// window has since closed, force-finalize the attempt via the CONNECTION_LOSS
// trigger instead, so it doesn't dangle forever past the exam's own deadline.
@Injectable()
export class LiveKitDisconnectSweepService {
    private readonly logger = new Logger(LiveKitDisconnectSweepService.name);

    constructor(
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examRoomAssignmentRepositoryService: ExamRoomAssignmentRepositoryService,
        private readonly examAttemptService: ExamAttemptService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async sweep(): Promise<void> {
        const disconnected = await this.examRoomAssignmentRepositoryService.findDisconnected();

        for (const assignment of disconnected) {
            try {
                await this.processOne(assignment);
            } catch (error) {
                this.logger.error(`Disconnect sweep failed for assignment ${assignment._id}`, error as Error);
            }
        }
    }

    private async processOne(assignment: any): Promise<void> {
        const exam = await this.examRepositoryService.findByIdRaw(assignment.examId.toString());
        if (!exam) return;

        const graceMinutes = (exam.securitySettings as any)?.connectionLossGracePeriodMinutes ?? DEFAULT_GRACE_MINUTES;
        const elapsedMs = Date.now() - new Date(assignment.disconnectedAt).getTime();
        if (elapsedMs < graceMinutes * 60000) return; // still within grace period

        // This sweep only ever runs for PROCTORING assignments (LiveKit rooms
        // don't exist for AUTO exams), so exam.endTime is always set here in
        // practice — the fallback just satisfies the now-optional type.
        const windowEnd = combineDateTimeIST(exam.endDate, exam.endTime || '23:59');
        if (Date.now() > windowEnd.getTime() && assignment.attemptId) {
            await this.examAttemptService.finalizeAttemptByFaculty(
                (assignment.attemptId as Types.ObjectId).toString(),
                SubmissionTrigger.CONNECTION_LOSS,
            );
            return;
        }

        await this.examRoomAssignmentRepositoryService.updateById(assignment._id as Types.ObjectId, {
            status: RoomAssignmentStatus.DISCONNECTED,
        } as any);
    }

}
