import * as crypto from 'crypto';
import { Types } from 'mongoose';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { AttemptStatus, ChatRecipientType, ChatSenderRole, ExamMode, ExamStatus, MediaStatus, QuestionType, RecordingMediaType, SubmissionTrigger, ViolationType } from 'src/utils/enum';

// Repositories
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { StudentAcademicDetailRepositoryService } from 'src/repositories/student-academic-detail-repository/student-academic-detail.repository';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamQuestionRepositoryService } from 'src/repositories/exam-question-repository/exam-question.repository';
import { ExamAttemptRepositoryService } from 'src/repositories/exam-attempt-repository/exam-attempt.repository';
import { ExamAnswerRepositoryService } from 'src/repositories/exam-answer-repository/exam-answer.repository';
import { ExamRecordingRepositoryService } from 'src/repositories/exam-recording-repository/exam-recording.repository';
import { ExamRoomRepositoryService } from 'src/repositories/exam-room-repository/exam-room.repository';
import { ExamRoomAssignmentRepositoryService } from 'src/repositories/exam-room-assignment-repository/exam-room-assignment.repository';
import { ExamRoomChatMessageRepositoryService } from 'src/repositories/exam-room-chat-message-repository/exam-room-chat-message.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigService } from 'src/config/config.service';
import { LiveKitService } from 'src/livekit/livekit.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';

const SUBMIT_GRACE_MS = 5000;
const QR_TOKEN_TTL_MS = 15 * 60 * 1000;

function hashQrToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

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
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly examRoomAssignmentRepositoryService: ExamRoomAssignmentRepositoryService,
        private readonly examRoomChatMessageRepositoryService: ExamRoomChatMessageRepositoryService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly configService: ConfigService,
        private readonly liveKitService: LiveKitService,
        private readonly authJwtService: AuthJwtService,
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

    private sanitizeQuestion(question: any, optionOrder?: string[]) {
        let options = question.options;
        if (optionOrder && options) {
            const optionById = new Map(options.map((opt: any) => [opt.optionId, opt]));
            options = optionOrder.map((id) => optionById.get(id)).filter(Boolean);
        }
        return {
            _id: question._id.toString(),
            type: question.type,
            text: question.text,
            marks: question.marks,
            order: question.order,
            options: options?.map((opt: any) => ({ optionId: opt.optionId, text: opt.text })),
        };
    }

    // Fisher-Yates shuffle — used for per-student question/option order (securitySettings)
    private shuffleArray<T>(items: T[]): T[] {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    // Reorders a freshly-fetched question list to match an attempt's stored
    // questionOrder — falls back to fetch order if the attempt predates it
    private applyQuestionOrder(questions: any[], questionOrder?: Types.ObjectId[]): any[] {
        if (!questionOrder || questionOrder.length === 0) return questions;
        const questionById = new Map(questions.map((q) => [(q._id as Types.ObjectId).toString(), q]));
        return questionOrder.map((id) => questionById.get(id.toString())).filter(Boolean);
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
                status: [ExamStatus.PUBLISHED, ExamStatus.ONGOING, ExamStatus.COMPLETED, ExamStatus.RESULTS_PUBLISHED],
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
            const resultsPublished = exam.status === ExamStatus.RESULTS_PUBLISHED;
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
                totalScore: resultsPublished ? attempt?.totalScore : undefined,
                passed: resultsPublished ? attempt?.passed : undefined,
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

        const attempt = await this.createAttemptRecord(examId, studentId, questions, exam.securitySettings);

        return this.buildStartResponse(exam, attempt, questions);
    }


    // Create the attempt record + seed its answers/recording — shared by the AUTO
    // start path above and the PROCTORING faculty-admission path below. startedAt
    // is always "now" at the moment this runs (lobby-entry time for AUTO's
    // immediate case, ADMISSION time for PROCTORING — never lobby-entry time).
    // Applies the exam's shuffleQuestions/shuffleOptions securitySettings, if set,
    // to compute this student's own questionOrder/optionOrder up front.
    private async createAttemptRecord(
        examId: string,
        studentId: string,
        questions: any[],
        securitySettings: any,
        roomId?: Types.ObjectId,
    ) {
        const orderedQuestions = securitySettings?.shuffleQuestions ? this.shuffleArray(questions) : questions;
        const questionOrder = orderedQuestions.map((q) => q._id as Types.ObjectId);

        let optionOrder: Record<string, string[]> | undefined;
        if (securitySettings?.shuffleOptions) {
            optionOrder = {};
            for (const question of orderedQuestions) {
                if (question.options && question.options.length > 0) {
                    optionOrder[(question._id as Types.ObjectId).toString()] =
                        this.shuffleArray(question.options.map((opt: any) => opt.optionId));
                }
            }
        }

        const attempt = await this.examAttemptRepositoryService.create({
            examId: new Types.ObjectId(examId),
            studentId: new Types.ObjectId(studentId),
            status: AttemptStatus.IN_PROGRESS,
            startedAt: new Date(),
            questionOrder,
            ...(optionOrder ? { optionOrder } : {}),
            ...(roomId ? { roomId } : {}),
        } as any);

        const attemptId = attempt._id as Types.ObjectId;
        await this.examAnswerRepositoryService.createMany(
            questionOrder.map((questionId) => ({ attemptId, questionId })),
        );
        await this.examRecordingRepositoryService.create(attemptId);

        return attempt;
    }


    // Called by the faculty admission flow (FacultyService.admitStudentAPI) to
    // create the student's attempt at the moment they're admitted into the room
    async createAttemptOnAdmission(examId: string, studentId: string, roomId: Types.ObjectId) {
        const exam = await this.examRepositoryService.findByIdRaw(examId);
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }
        const questions = await this.examQuestionRepositoryService.findByExamId(examId);
        if (questions.length < 1) {
            throw new BadRequestException('This exam has no questions yet');
        }
        return this.createAttemptRecord(examId, studentId, questions, exam.securitySettings, roomId);
    }

    private async buildStartResponse(exam: any, attempt: any, questions?: any[]) {
        const qs = questions || (await this.examQuestionRepositoryService.findByExamId(exam._id.toString()));
        const orderedQuestions = this.applyQuestionOrder(qs, attempt.questionOrder);
        return {
            attemptId: (attempt._id as Types.ObjectId).toString(),
            examId: exam._id.toString(),
            examName: exam.name,
            durationMinutes: exam.durationMinutes,
            startedAt: attempt.startedAt,
            securitySettings: exam.securitySettings,
            questions: orderedQuestions.map((q) =>
                this.sanitizeQuestion(q, attempt.optionOrder?.[(q._id as Types.ObjectId).toString()]),
            ),
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
        const orderedQuestions = this.applyQuestionOrder(questions, attempt.questionOrder);
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
            securitySettings: exam.securitySettings,
            questions: orderedQuestions.map((q) =>
                this.sanitizeQuestion(q, (attempt as any).optionOrder?.[(q._id as Types.ObjectId).toString()]),
            ),
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


    // Submit (finalize) an attempt — the student-initiated entry point into the
    // shared finalizeAttempt logic below
    async submitAttemptAPI(userId: string, attemptId: string, clientTrigger: SubmissionTrigger) {
        const { attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        const exam = await this.examRepositoryService.findByIdRaw(attempt.examId.toString());
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }

        return this.finalizeAttempt(attempt, exam, clientTrigger);
    }


    // Log a client-detected integrity violation (tab-switch, fullscreen exit,
    // copy/paste or right-click attempt). Flags the attempt, and force-submits it
    // via the shared finalizeAttempt path once the type's configured threshold is reached.
    async reportViolationAPI(userId: string, attemptId: string, type: ViolationType) {
        const { attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new ForbiddenException('This attempt is no longer in progress');
        }

        const exam = await this.examRepositoryService.findByIdRaw(attempt.examId.toString());
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }

        const updatedAttempt = await this.examAttemptRepositoryService.appendViolation(attemptId, type);
        const violationCount = (updatedAttempt?.violations || []).filter((v) => v.type === type).length;

        const threshold =
            type === ViolationType.TAB_SWITCH ? exam.securitySettings?.tabSwitchViolationThreshold :
                type === ViolationType.FULLSCREEN_EXIT ? exam.securitySettings?.fullScreenExitViolationThreshold :
                    undefined;

        if (threshold && violationCount >= threshold) {
            const result = await this.finalizeAttempt(updatedAttempt, exam, SubmissionTrigger.INTEGRITY_AUTO_SUBMIT);
            return { ...result, violationCount, terminated: true };
        }

        return { message: 'Violation recorded', violationCount, terminated: false };
    }


    // Faculty-initiated finalization (forced removal from a proctoring room) —
    // callable without a student userId, since the faculty doesn't act as the student
    async finalizeAttemptByFaculty(attemptId: string, trigger: SubmissionTrigger) {
        const attempt = await this.examAttemptRepositoryService.findById(attemptId);
        if (!attempt) {
            throw new NotFoundException('Attempt not found');
        }
        const exam = await this.examRepositoryService.findByIdRaw(attempt.examId.toString());
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }
        return this.finalizeAttempt(attempt, exam, trigger);
    }


    // The single "ending an attempt" code path — computes objective score and
    // finalizes status, shared by both the student's own submit and a faculty removal
    private async finalizeAttempt(attempt: any, exam: any, clientTrigger: SubmissionTrigger) {
        const attemptId = (attempt._id as Types.ObjectId).toString();

        if (attempt.status === AttemptStatus.SUBMITTED || attempt.status === AttemptStatus.COMPLETED) {
            return {
                message: 'Attempt already submitted',
                status: attempt.status,
                objectiveScore: attempt.objectiveScore,
                totalScore: attempt.totalScore,
                passed: attempt.passed,
            };
        }
        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new ForbiddenException('Attempt cannot be submitted from its current state');
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


    // Join the waiting room for a PROCTORING exam — requires the admin to have
    // already run room formation; does not itself create an attempt or connect to LiveKit
    async joinLobbyAPI(userId: string, examId: string) {
        const { student, academicDetail } = await this.resolveStudent(userId);

        const exam = await this.examRepositoryService.findByIdRaw(examId);
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }
        if (exam.mode !== ExamMode.PROCTORING) {
            throw new BadRequestException('This exam is not a PROCTORING-mode exam');
        }
        if (exam.status !== ExamStatus.PUBLISHED && exam.status !== ExamStatus.ONGOING) {
            throw new ForbiddenException('This exam is not currently open');
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
        const assignment = await this.examRoomAssignmentRepositoryService.findByExamAndStudent(examId, studentId);
        if (!assignment) {
            throw new NotFoundException('Room not yet assigned for this exam — please try again closer to the exam start time');
        }

        if (!assignment.enteredWaitingRoomAt) {
            await this.examRoomAssignmentRepositoryService.updateById((assignment._id as Types.ObjectId).toString(), {
                enteredWaitingRoomAt: new Date(),
            });
        }

        return {
            roomId: assignment.roomId.toString(),
            assignmentId: (assignment._id as Types.ObjectId).toString(),
            status: assignment.status,
        };
    }


    // Poll target for the waiting room — reports admission/rejection once a faculty acts
    async getLobbyStatusAPI(userId: string, assignmentId: string) {
        const { student } = await this.resolveStudent(userId);

        const assignment = await this.examRoomAssignmentRepositoryService.findById(assignmentId);
        if (!assignment || assignment.studentId.toString() !== (student._id as Types.ObjectId).toString()) {
            throw new NotFoundException('Assignment not found');
        }

        return {
            status: assignment.status,
            attemptId: assignment.attemptId ? assignment.attemptId.toString() : null,
            removalReason: assignment.removalReason,
        };
    }


    // Issue a LiveKit room-join token for an admitted, in-progress attempt
    async getLiveKitTokenAPI(userId: string, attemptId: string) {
        const { student, attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new ForbiddenException('Attempt is not currently in progress');
        }
        if (!attempt.roomId) {
            throw new ForbiddenException('This attempt is not part of a proctoring room');
        }

        const room = await this.examRoomRepositoryService.findById(attempt.roomId);
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        const identity = `student-${(student._id as Types.ObjectId).toString()}`;
        const token = await this.liveKitService.generateToken(
            room.liveKitSessionId,
            identity,
            student.studentId,
            { canPublish: true, canSubscribe: true, canPublishData: true },
        );

        return {
            token,
            liveKitUrl: this.configService.getLiveKitUrl(),
            roomName: room.liveKitSessionId,
            roomId: (room._id as Types.ObjectId).toString(),
            identity,
            facultyIdentity: `faculty-${room.facultyId.toString()}`,
        };
    }


    // Send a chat message to the room's faculty — always INDIVIDUAL, since a
    // student can only address the one invigilator assigned to their room
    async sendChatAPI(userId: string, roomId: string, message: string) {
        const { student } = await this.resolveStudent(userId);
        const studentId = (student._id as Types.ObjectId).toString();

        const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndStudent(roomId, studentId);
        if (!assignment) {
            throw new NotFoundException('You are not assigned to this room');
        }

        const chatMessage = await this.examRoomChatMessageRepositoryService.create({
            roomId: new Types.ObjectId(roomId),
            senderRole: ChatSenderRole.STUDENT,
            senderId: new Types.ObjectId(userId),
            recipientType: ChatRecipientType.INDIVIDUAL,
            message,
            sentAt: new Date(),
        } as any);

        return this.mapChatMessage(chatMessage);
    }


    // Chat history for the room, filtered so a student never sees another
    // student's individual messages to the faculty (broadcasts are visible to all)
    async getChatHistoryAPI(userId: string, roomId: string) {
        const { student } = await this.resolveStudent(userId);
        const studentId = (student._id as Types.ObjectId).toString();

        const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndStudent(roomId, studentId);
        if (!assignment) {
            throw new NotFoundException('You are not assigned to this room');
        }

        const messages = await this.examRoomChatMessageRepositoryService.findByRoomId(roomId);
        const visible = messages.filter((m) =>
            m.senderId.toString() === userId ||
            m.recipientType === ChatRecipientType.BROADCAST_ROOM ||
            (m.recipientType === ChatRecipientType.INDIVIDUAL && m.recipientStudentId?.toString() === studentId),
        );

        return visible.map((m) => this.mapChatMessage(m));
    }

    private mapChatMessage(message: any) {
        return {
            _id: message._id.toString(),
            senderRole: message.senderRole,
            senderId: message.senderId.toString(),
            recipientType: message.recipientType,
            recipientStudentId: message.recipientStudentId ? message.recipientStudentId.toString() : undefined,
            message: message.message,
            sentAt: message.sentAt,
        };
    }


    // Resolve + ownership-check a WRITTEN question's pre-seeded answer row for this attempt
    private async resolveWrittenAnswer(userId: string, attemptId: string, questionId: string) {
        const { attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new ForbiddenException('This attempt is no longer in progress');
        }

        const question = await this.examQuestionRepositoryService.findById(questionId);
        if (!question || question.examId.toString() !== attempt.examId.toString()) {
            throw new NotFoundException('Question not found');
        }
        if (question.type !== QuestionType.WRITTEN) {
            throw new BadRequestException('This question is not a WRITTEN question');
        }

        const answer = await this.examAnswerRepositoryService.findByAttemptAndQuestion(attemptId, questionId);
        if (!answer) {
            throw new NotFoundException('Answer row not found');
        }

        return { answer };
    }


    // Generate a fresh QR token for a WRITTEN question — displayed on desktop, scanned on the student's phone
    async generateWrittenQrAPI(userId: string, attemptId: string, questionId: string) {
        const { answer } = await this.resolveWrittenAnswer(userId, attemptId, questionId);

        if (answer.isFinalized) {
            throw new ForbiddenException('This written answer has already been finalized');
        }

        const answerId = (answer._id as Types.ObjectId).toString();
        const token = this.authJwtService.generateWrittenAnswerQrToken({
            sub: answerId,
            attemptId,
            questionId,
        });

        const expiresAt = new Date(Date.now() + QR_TOKEN_TTL_MS);
        await this.examAnswerRepositoryService.updateById(answerId, {
            qrTokenHash: hashQrToken(token),
            qrGeneratedAt: new Date(),
            qrTokenExpiresAt: expiresAt,
            // null (not undefined) — Mongoose strips undefined values from update
            // payloads entirely, which would silently leave a stale scan timestamp in place.
            qrScannedAt: null,
        } as any);

        return { token, expiresAt };
    }


    // Poll target for the desktop screen while the QR is displayed
    async getWrittenQrStatusAPI(userId: string, attemptId: string, questionId: string) {
        const { answer } = await this.resolveWrittenAnswer(userId, attemptId, questionId);

        return {
            pageCount: answer.pages.length,
            qrScannedAt: answer.qrScannedAt,
            isFinalized: answer.isFinalized,
            qrTokenExpiresAt: answer.qrTokenExpiresAt,
        };
    }


    // Desktop-side "I'm done" action — locks in the uploaded pages as the final answer
    async finalizeWrittenAnswerAPI(userId: string, attemptId: string, questionId: string) {
        const { answer } = await this.resolveWrittenAnswer(userId, attemptId, questionId);

        if (answer.pages.length === 0) {
            throw new BadRequestException('Please upload at least one page before finishing');
        }

        await this.examAnswerRepositoryService.updateById((answer._id as Types.ObjectId).toString(), {
            isFinalized: true,
        });

        return { message: 'Written answer saved', pageCount: answer.pages.length };
    }


    // Get My Result API Endpoint — full per-question breakdown, only once results are published
    async getMyResultAPI(userId: string, attemptId: string) {
        const { attempt } = await this.ownAttemptOrThrow(userId, attemptId);

        const exam = await this.examRepositoryService.findByIdRaw(attempt.examId.toString());
        if (!exam) throw new NotFoundException('Exam not found');

        if (exam.status !== ExamStatus.RESULTS_PUBLISHED) {
            throw new ForbiddenException('Results for this exam have not been published yet');
        }

        const questions = await this.examQuestionRepositoryService.findByExamId(attempt.examId.toString());
        const answers = await this.examAnswerRepositoryService.findByAttemptId(attemptId);
        const answerByQuestionId = new Map(answers.map((a) => [a.questionId.toString(), a]));

        const questionBreakdown = questions.map((question) => {
            const answer = answerByQuestionId.get((question._id as Types.ObjectId).toString());

            if (question.type === QuestionType.WRITTEN) {
                return {
                    questionId: (question._id as Types.ObjectId).toString(),
                    type: question.type,
                    text: question.text,
                    maxMarks: question.marks,
                    marksObtained: answer?.marksAwarded ?? 0,
                    remarks: answer?.remarks,
                    pages: answer?.pages || [],
                };
            }

            const correctIds = new Set(question.correctOptionIds || []);
            let marksObtained = 0;
            if (question.type === QuestionType.MCQ) {
                if (answer?.selectedOptionId && correctIds.has(answer.selectedOptionId) && correctIds.size === 1) {
                    marksObtained = question.marks;
                }
            } else if (question.type === QuestionType.MSQ) {
                const selected = new Set(answer?.selectedOptionIds || []);
                const isExactMatch = selected.size === correctIds.size && [...selected].every((id) => correctIds.has(id));
                if (isExactMatch && selected.size > 0) {
                    marksObtained = question.marks;
                }
            }

            return {
                questionId: (question._id as Types.ObjectId).toString(),
                type: question.type,
                text: question.text,
                maxMarks: question.marks,
                marksObtained,
            };
        });

        return {
            examName: exam.name,
            totalMarks: exam.totalMarks,
            passingMarks: exam.passingMarks,
            objectiveScore: attempt.objectiveScore,
            writtenScore: attempt.writtenScore,
            totalScore: attempt.totalScore,
            passed: attempt.passed,
            questions: questionBreakdown,
        };
    }

}
