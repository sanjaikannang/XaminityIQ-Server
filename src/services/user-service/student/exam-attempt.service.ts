import { Types } from 'mongoose';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { AttemptStatus, ExamMode, ExamStatus, MediaStatus, QuestionType, RecordingMediaType, SubmissionTrigger } from 'src/utils/enum';

// Repositories
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { StudentAcademicDetailRepositoryService } from 'src/repositories/student-academic-detail-repository/student-academic-detail.repository';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamQuestionRepositoryService } from 'src/repositories/exam-question-repository/exam-question.repository';
import { ExamAttemptRepositoryService } from 'src/repositories/exam-attempt-repository/exam-attempt.repository';
import { ExamAnswerRepositoryService } from 'src/repositories/exam-answer-repository/exam-answer.repository';
import { ExamRecordingRepositoryService } from 'src/repositories/exam-recording-repository/exam-recording.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

const SUBMIT_GRACE_MS = 5000;

@Injectable()
export class ExamAttemptService {
    constructor(
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly studentAcademicDetailRepositoryService: StudentAcademicDetailRepositoryService,
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examQuestionRepositoryService: ExamQuestionRepositoryService,
        private readonly examAttemptRepositoryService: ExamAttemptRepositoryService,
        private readonly examAnswerRepositoryService: ExamAnswerRepositoryService,
        private readonly examRecordingRepositoryService: ExamRecordingRepositoryService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }


    // Resolve the authenticated student's own Student doc + academic detail (batch/
    // course/department/section/semester) — every method below is scoped to these,
    // never to client-supplied ids.
    private async resolveStudent(userId: string) {
        const student = await this.studentRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!student) {
            throw new NotFoundException('Student profile not found');
        }

        const academicDetail = await this.studentAcademicDetailRepositoryService.findById(
            student.academicDetailId as Types.ObjectId,
        );
        if (!academicDetail) {
            throw new NotFoundException('Student academic details not found');
        }

        return { student, academicDetail };
    }

    private sanitizeQuestion(question: any) {
        return {
            _id: question._id.toString(),
            type: question.type,
            text: question.text,
            marks: question.marks,
            order: question.order,
            options: question.options?.map((opt: any) => ({ optionId: opt.optionId, text: opt.text })),
        };
    }

    private async ownAttemptOrThrow(userId: string, attemptId: string) {
        const { student } = await this.resolveStudent(userId);
        const attempt = await this.examAttemptRepositoryService.findById(attemptId);
        if (!attempt || attempt.studentId.toString() !== (student._id as Types.ObjectId).toString()) {
            throw new NotFoundException('Attempt not found');
        }
        return { student, attempt };
    }


    // Get My Exams API Endpoint — AUTO exams matching the student's own hierarchy,
    // annotated with their own attempt status (if any)
    async getMyExamsAPI(userId: string) {
        const { student, academicDetail } = await this.resolveStudent(userId);

        const exams = await this.examRepositoryService.findAllWithFilters(
            {
                mode: ExamMode.AUTO,
                status: [ExamStatus.PUBLISHED, ExamStatus.ONGOING, ExamStatus.COMPLETED],
                batchId: academicDetail.batchId.toString(),
                courseId: academicDetail.courseId.toString(),
                departmentId: academicDetail.departmentId.toString(),
                sectionId: academicDetail.sectionId.toString(),
                semester: academicDetail.currentSemester,
            },
            0,
            1000,
            'startDate',
            'asc',
        );

        const attempts = await this.examAttemptRepositoryService.findByStudentAndExamIds(
            (student._id as Types.ObjectId).toString(),
            exams.map((e) => (e._id as Types.ObjectId).toString()),
        );
        const attemptByExamId = new Map(attempts.map((a) => [a.examId.toString(), a]));

        return exams.map((exam: any) => {
            const attempt = attemptByExamId.get(exam._id.toString());
            return {
                _id: exam._id.toString(),
                name: exam.name,
                description: exam.description,
                mode: exam.mode,
                status: exam.status,
                subjectName: exam.subjectId?.subjectName,
                durationMinutes: exam.durationMinutes,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                startDate: exam.startDate,
                endDate: exam.endDate,
                myAttemptId: attempt ? (attempt._id as Types.ObjectId).toString() : null,
                myAttemptStatus: attempt ? attempt.status : null,
            };
        });
    }


    // Start (or resume) an attempt
    async startAttemptAPI(userId: string, examId: string) {
        const { student, academicDetail } = await this.resolveStudent(userId);

        const exam = await this.examRepositoryService.findByIdRaw(examId);
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }
        if (exam.mode !== ExamMode.AUTO) {
            throw new BadRequestException('This exam is not an AUTO-mode exam');
        }
        if (exam.status !== ExamStatus.PUBLISHED && exam.status !== ExamStatus.ONGOING) {
            throw new ForbiddenException('This exam is not currently open');
        }

        const now = new Date();
        if (now < exam.startDate || now > exam.endDate) {
            throw new ForbiddenException('This exam is outside its scheduled window');
        }

        const matchesHierarchy =
            exam.batchId.toString() === academicDetail.batchId.toString() &&
            exam.courseId.toString() === academicDetail.courseId.toString() &&
            exam.departmentId.toString() === academicDetail.departmentId.toString() &&
            exam.sectionId.toString() === academicDetail.sectionId.toString() &&
            exam.semester === academicDetail.currentSemester;
        if (!matchesHierarchy) {
            throw new ForbiddenException('You are not assigned to this exam');
        }

        const studentId = (student._id as Types.ObjectId).toString();
        const existing = await this.examAttemptRepositoryService.findByExamAndStudent(examId, studentId);

        if (existing) {
            if (existing.status === AttemptStatus.IN_PROGRESS) {
                return this.buildStartResponse(exam, existing);
            }
            throw new ConflictException('You have already attempted this exam');
        }

        const questions = await this.examQuestionRepositoryService.findByExamId(examId);
        if (questions.length < 1) {
            throw new BadRequestException('This exam has no questions yet');
        }

        const attempt = await this.examAttemptRepositoryService.create({
            examId: new Types.ObjectId(examId),
            studentId: new Types.ObjectId(studentId),
            status: AttemptStatus.IN_PROGRESS,
            startedAt: now,
            questionOrder: questions.map((q) => q._id as Types.ObjectId),
        } as any);

        const attemptId = attempt._id as Types.ObjectId;
        await this.examAnswerRepositoryService.createMany(
            questions.map((q) => ({ attemptId, questionId: q._id as Types.ObjectId })),
        );
        await this.examRecordingRepositoryService.create(attemptId);

        return this.buildStartResponse(exam, attempt, questions);
    }

    private async buildStartResponse(exam: any, attempt: any, questions?: any[]) {
        const qs = questions || (await this.examQuestionRepositoryService.findByExamId(exam._id.toString()));
        return {
            attemptId: (attempt._id as Types.ObjectId).toString(),
            examId: exam._id.toString(),
            examName: exam.name,
            durationMinutes: exam.durationMinutes,
            startedAt: attempt.startedAt,
            questions: qs.map((q) => this.sanitizeQuestion(q)),
        };
    }


    // Get attempt detail (resume support)
    async getAttemptAPI(userId: string, attemptId: string) {
        const { attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        const exam = await this.examRepositoryService.findByIdRaw(attempt.examId.toString());
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }

        const questions = await this.examQuestionRepositoryService.findByExamId(attempt.examId.toString());
        const answers = await this.examAnswerRepositoryService.findByAttemptId(attemptId);

        const elapsedMs = attempt.startedAt ? Date.now() - new Date(attempt.startedAt).getTime() : 0;
        const totalMs = exam.durationMinutes * 60000;
        const remainingMs = Math.max(0, totalMs - elapsedMs);

        return {
            attemptId,
            examId: (exam._id as Types.ObjectId).toString(),
            examName: exam.name,
            durationMinutes: exam.durationMinutes,
            startedAt: attempt.startedAt,
            status: attempt.status,
            remainingMs,
            questions: questions.map((q) => this.sanitizeQuestion(q)),
            answers: answers.map((a) => ({
                questionId: a.questionId.toString(),
                selectedOptionId: a.selectedOptionId,
                selectedOptionIds: a.selectedOptionIds,
            })),
        };
    }


    // Save an MCQ/MSQ answer
    async saveAnswerAPI(
        userId: string,
        attemptId: string,
        questionId: string,
        data: { selectedOptionId?: string; selectedOptionIds?: string[] },
    ) {
        const { attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new ForbiddenException('This attempt is no longer in progress');
        }

        const exam = await this.examRepositoryService.findByIdRaw(attempt.examId.toString());
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }
        const deadline = new Date(attempt.startedAt as Date).getTime() + exam.durationMinutes * 60000;
        if (Date.now() > deadline + SUBMIT_GRACE_MS) {
            throw new ForbiddenException('Exam time has expired — please submit');
        }

        const question = await this.examQuestionRepositoryService.findById(questionId);
        if (!question || question.examId.toString() !== attempt.examId.toString()) {
            throw new NotFoundException('Question not found');
        }

        const validOptionIds = new Set((question.options || []).map((o) => o.optionId));
        if (question.type === QuestionType.MCQ) {
            if (!data.selectedOptionId || !validOptionIds.has(data.selectedOptionId)) {
                throw new BadRequestException('Invalid option selected');
            }
            await this.examAnswerRepositoryService.upsertAnswer(attemptId, questionId, {
                selectedOptionId: data.selectedOptionId,
            });
        } else if (question.type === QuestionType.MSQ) {
            const selected = data.selectedOptionIds || [];
            if (selected.length < 1 || !selected.every((id) => validOptionIds.has(id))) {
                throw new BadRequestException('Invalid options selected');
            }
            await this.examAnswerRepositoryService.upsertAnswer(attemptId, questionId, {
                selectedOptionIds: selected,
            });
        } else {
            throw new BadRequestException('WRITTEN questions cannot be answered this way yet');
        }

        return { message: 'Answer saved' };
    }


    // Submit (finalize) an attempt — the single "ending an attempt" code path
    async submitAttemptAPI(userId: string, attemptId: string, clientTrigger: SubmissionTrigger) {
        const { attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        if (attempt.status === AttemptStatus.SUBMITTED || attempt.status === AttemptStatus.COMPLETED) {
            return { message: 'Attempt already submitted', status: attempt.status };
        }
        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new ForbiddenException('Attempt cannot be submitted from its current state');
        }

        const exam = await this.examRepositoryService.findByIdRaw(attempt.examId.toString());
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }

        const deadline = new Date(attempt.startedAt as Date).getTime() + exam.durationMinutes * 60000;
        const isPastDeadline = Date.now() > deadline + SUBMIT_GRACE_MS;
        const trigger = isPastDeadline ? SubmissionTrigger.TIMER_EXPIRY : clientTrigger;

        const questions = await this.examQuestionRepositoryService.findByExamId(attempt.examId.toString());
        const answers = await this.examAnswerRepositoryService.findByAttemptId(attemptId);
        const answerByQuestionId = new Map(answers.map((a) => [a.questionId.toString(), a]));

        let objectiveScore = 0;
        let hasWritten = false;

        for (const question of questions) {
            if (question.type === QuestionType.WRITTEN) {
                hasWritten = true;
                continue;
            }

            const answer = answerByQuestionId.get((question._id as Types.ObjectId).toString());
            const correctIds = new Set(question.correctOptionIds || []);

            if (question.type === QuestionType.MCQ) {
                if (answer?.selectedOptionId && correctIds.has(answer.selectedOptionId) && correctIds.size === 1) {
                    objectiveScore += question.marks;
                }
            } else if (question.type === QuestionType.MSQ) {
                const selected = new Set(answer?.selectedOptionIds || []);
                const isExactMatch =
                    selected.size === correctIds.size &&
                    [...selected].every((id) => correctIds.has(id));
                if (isExactMatch && selected.size > 0) {
                    objectiveScore += question.marks;
                }
            }
        }

        const updatePayload: any = {
            status: AttemptStatus.SUBMITTED,
            submittedAt: new Date(),
            submissionTrigger: trigger,
            objectiveScore,
        };

        if (!hasWritten) {
            updatePayload.totalScore = objectiveScore;
            updatePayload.passed = objectiveScore >= exam.passingMarks;
        }

        const updated = await this.examAttemptRepositoryService.updateById(attemptId, updatePayload);

        return {
            message: 'Exam submitted successfully',
            status: updated!.status,
            objectiveScore: updated!.objectiveScore,
            totalScore: updated!.totalScore,
            passed: updated!.passed,
        };
    }


    // Cloudinary signed-upload signature for one recording chunk
    async getUploadSignatureAPI(userId: string, attemptId: string, mediaType: RecordingMediaType, sequence: number) {
        const { attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        if (attempt.status !== AttemptStatus.IN_PROGRESS && attempt.status !== AttemptStatus.SUBMITTED) {
            throw new ForbiddenException('Recording is not active for this attempt');
        }

        // publicId is relative to folder — Cloudinary concatenates them as
        // folder/publicId, so publicId must NOT repeat the folder path here.
        const publicId = `${sequence}`;
        const folder = `exam-recordings/${attemptId}/${mediaType}`;

        return this.cloudinaryService.generateUploadSignature(publicId, folder);
    }


    // Record a successfully-uploaded chunk's metadata
    async recordChunkAPI(
        userId: string,
        attemptId: string,
        mediaType: RecordingMediaType,
        sequence: number,
        cloudinaryAssetId: string,
        cloudinaryUrl: string,
    ) {
        await this.ownAttemptOrThrow(userId, attemptId);

        await this.examRecordingRepositoryService.appendChunk(attemptId, mediaType, {
            sequence,
            cloudinaryAssetId,
            cloudinaryUrl,
            uploadedAt: new Date(),
        });

        return { message: 'Chunk recorded' };
    }


    // Finalize one recording stream; once all three are complete, mark the attempt COMPLETE
    async finalizeRecordingAPI(userId: string, attemptId: string, mediaType: RecordingMediaType) {
        const { attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        await this.examRecordingRepositoryService.markStreamComplete(attemptId, mediaType);
        const recording = await this.examRecordingRepositoryService.findByAttemptId(attemptId);

        const allComplete =
            recording?.video.status === MediaStatus.UPLOAD_COMPLETE &&
            recording?.audio.status === MediaStatus.UPLOAD_COMPLETE &&
            recording?.screen.status === MediaStatus.UPLOAD_COMPLETE;

        if (allComplete) {
            const isSubmitted = attempt.status === AttemptStatus.SUBMITTED;
            await this.examAttemptRepositoryService.updateById(attemptId, {
                mediaStatus: MediaStatus.UPLOAD_COMPLETE,
                ...(isSubmitted ? { status: AttemptStatus.COMPLETED } : {}),
            } as any);
        }

        return { message: 'Recording stream finalized', allComplete };
    }

}
