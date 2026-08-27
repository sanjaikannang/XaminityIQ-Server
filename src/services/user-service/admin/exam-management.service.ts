import { Types } from 'mongoose';
import { ulid } from 'ulid';
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { AttemptStatus, ExamMode, ExamRoomStatus, ExamStatus, MediaStatus, QuestionType, RoomAssignmentStatus, StudentStatus } from 'src/utils/enum';
import { combineDateTimeIST } from 'src/utils/date.util';

// Requests
import { CreateExamRequest } from 'src/api/user/admin/exam-management/create-exam/create-exam.request';
import { EditExamRequest } from 'src/api/user/admin/exam-management/edit-exam/edit-exam.request';
import { GetAllExamsRequest } from 'src/api/user/admin/exam-management/get-all-exams/get-all-exams.request';
import { AddQuestionRequest } from 'src/api/user/admin/exam-management/add-question/add-question.request';
import { EditQuestionRequest } from 'src/api/user/admin/exam-management/edit-question/edit-question.request';

// Response
import { ExamData, PaginationMeta } from 'src/api/user/admin/exam-management/get-all-exams/get-all-exams.response';
import { ExamDetailData } from 'src/api/user/admin/exam-management/get-exam/get-exam.response';
import { QuestionData } from 'src/api/user/admin/exam-management/add-question/add-question.response';

// Repositories
import { BatchRepositoryService } from 'src/repositories/batch-repository/batch.repository';
import { CourseRepositoryService } from 'src/repositories/course-repository/course.repository';
import { BatchCourseRepositoryService } from 'src/repositories/batch-course-repository/batch-course.repository';
import { DepartmentRepositoryService } from 'src/repositories/department-repository/department.repository';
import { BatchDepartmentRepositoryService } from 'src/repositories/batch-department-repository/batch-department.repository';
import { SectionRepositoryService } from 'src/repositories/section-repository/section.repository';
import { SubjectRepositoryService } from 'src/repositories/subject-repository/subject.repository';
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { StudentPersonalDetailRepositoryService } from 'src/repositories/student-personal-detail-repository/student-personal-detail.repository';
import { StudentContactInformationRepositoryService } from 'src/repositories/student-contact-information-repository/student-contact-information.repository';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamQuestionRepositoryService } from 'src/repositories/exam-question-repository/exam-question.repository';
import { FacultyRepositoryService } from 'src/repositories/faculty-repository/faculty.repository';
import { FacultyPersonalDetailRepositoryService } from 'src/repositories/faculty-personal-detail-repository/faculty-personal-detail.repository';
import { FacultyContactInformationRepositoryService } from 'src/repositories/faculty-contact-information-repository/faculty-contact-information.repository';
import { ExamRoomRepositoryService } from 'src/repositories/exam-room-repository/exam-room.repository';
import { ExamRoomAssignmentRepositoryService } from 'src/repositories/exam-room-assignment-repository/exam-room-assignment.repository';
import { FormedRoomData } from 'src/api/user/admin/exam-management/form-exam-rooms/form-exam-rooms.response';
import { ExamRoomSummaryData, RoomAssignmentDetailData } from 'src/api/user/admin/exam-management/get-exam-rooms/get-exam-rooms.response';
import { ExamAttemptRepositoryService } from 'src/repositories/exam-attempt-repository/exam-attempt.repository';
import { ExamAnswerRepositoryService } from 'src/repositories/exam-answer-repository/exam-answer.repository';
import { EvaluationProgressData } from 'src/api/user/admin/exam-management/get-evaluation-progress/get-evaluation-progress.response';
import { ExamAttemptSummaryData } from 'src/api/user/admin/exam-management/get-exam-attempts/get-exam-attempts.response';
import { GetAllExamRoomsRequest } from 'src/api/user/admin/exam-management/get-all-exam-rooms/get-all-exam-rooms.request';
import { RoomOverviewData, PaginationMeta as RoomPaginationMeta } from 'src/api/user/admin/exam-management/get-all-exam-rooms/get-all-exam-rooms.response';
import { AttemptRecordingData } from 'src/api/user/admin/exam-management/get-attempt-recording/get-attempt-recording.response';
import { AttemptQuestionAnswerData } from 'src/api/user/admin/exam-management/get-attempt-answers/get-attempt-answers.response';
import { ExamRecordingRepositoryService } from 'src/repositories/exam-recording-repository/exam-recording.repository';

const MIN_WRITTEN_MARKS = 2;
const MAX_WRITTEN_MARKS = 20;

// Question types scored by hand (photo upload / typed text), sharing the
// same marks-range constraint and the same evaluation queue.
const SUBJECTIVE_TYPES: QuestionType[] = [QuestionType.WRITTEN, QuestionType.TYPING];

@Injectable()
export class ExamManagementService {
    constructor(
        private readonly batchRepositoryService: BatchRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly batchCourseRepositoryService: BatchCourseRepositoryService,
        private readonly departmentRepositoryService: DepartmentRepositoryService,
        private readonly batchDepartmentRepositoryService: BatchDepartmentRepositoryService,
        private readonly sectionRepositoryService: SectionRepositoryService,
        private readonly subjectRepositoryService: SubjectRepositoryService,
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly studentPersonalDetailRepositoryService: StudentPersonalDetailRepositoryService,
        private readonly studentContactInformationRepositoryService: StudentContactInformationRepositoryService,
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examQuestionRepositoryService: ExamQuestionRepositoryService,
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly facultyPersonalDetailRepositoryService: FacultyPersonalDetailRepositoryService,
        private readonly facultyContactInformationRepositoryService: FacultyContactInformationRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly examRoomAssignmentRepositoryService: ExamRoomAssignmentRepositoryService,
        private readonly examAttemptRepositoryService: ExamAttemptRepositoryService,
        private readonly examAnswerRepositoryService: ExamAnswerRepositoryService,
        private readonly examRecordingRepositoryService: ExamRecordingRepositoryService,
    ) { }

    private readonly MAX_STUDENTS_PER_ROOM = 10;


    // Validate the academic hierarchy chain and mode-specific schedule; returns the
    // resolved course (needed by callers to bound the semester value)
    private async validateHierarchyAndSchedule(data: {
        batchId: string; courseId: string; departmentId: string; sectionId: string;
        semester: number; subjectId: string; mode: string; durationMinutes: number;
        startDate: string; endDate: string; startTime?: string; endTime?: string;
    }) {
        const batch = await this.batchRepositoryService.findById(data.batchId);
        if (!batch) throw new NotFoundException('Batch not found');

        const course = await this.courseRepositoryService.findById(data.courseId);
        if (!course) throw new NotFoundException('Course not found');

        const batchCourse = await this.batchCourseRepositoryService.findByBatchAndCourse(data.batchId, data.courseId);
        if (!batchCourse) throw new BadRequestException('Course is not mapped to the selected batch');

        const department = await this.departmentRepositoryService.findById(data.departmentId);
        if (!department) throw new NotFoundException('Department not found');

        const batchDepartment = await this.batchDepartmentRepositoryService.findByBatchCourseAndDept(
            (batchCourse._id as Types.ObjectId).toString(),
            data.departmentId,
        );
        if (!batchDepartment) throw new BadRequestException('Department is not mapped to the selected batch/course');

        const section = await this.sectionRepositoryService.findById(data.sectionId);
        if (!section) throw new NotFoundException('Section not found');
        if (
            section.batchId.toString() !== data.batchId ||
            section.courseId.toString() !== data.courseId ||
            section.departmentId.toString() !== data.departmentId
        ) {
            throw new BadRequestException('Section does not belong to the selected batch/course/department');
        }

        if (data.semester < 1 || data.semester > course.semesters) {
            throw new BadRequestException(`Semester must be between 1 and ${course.semesters} for this course`);
        }

        const subject = await this.subjectRepositoryService.findById(data.subjectId);
        if (!subject) throw new NotFoundException('Subject not found');
        if (subject.departmentId.toString() !== data.departmentId || subject.semester !== data.semester) {
            throw new BadRequestException('Subject does not belong to the selected department/semester');
        }

        // Time-of-day is required for both AUTO and PROCTORING — always IST
        // (see src/utils/date.util.ts). AUTO's own availability window
        // (student-facing startAttemptAPI) is IST-aware for the same reason.
        if (!data.startTime || !data.endTime) {
            throw new BadRequestException('Start Time and End Time are required');
        }
        const startDateTime = combineDateTimeIST(data.startDate, data.startTime);
        const endDateTime = combineDateTimeIST(data.endDate, data.endTime);
        if (endDateTime.getTime() <= startDateTime.getTime()) {
            throw new BadRequestException('End Date+Time must be after Start Date+Time');
        }
        if (endDateTime.getTime() - startDateTime.getTime() < data.durationMinutes * 60000) {
            throw new BadRequestException('The Start-End window must be at least as long as the Duration');
        }

        return { batch, course, department, section, subject };
    }

    // minTimePerExamMinutes must leave room for a manual submit — otherwise
    // only TIMER_EXPIRY could ever finalize the attempt.
    private validateMinTimeSettings(durationMinutes: number, securitySettings?: { minTimePerExamMinutes?: number }) {
        const minTime = securitySettings?.minTimePerExamMinutes;
        if (minTime && minTime >= durationMinutes) {
            throw new BadRequestException('Min. Time For Whole Exam must be less than the exam Duration');
        }
    }

    private validateMarks(totalMarks: number, passingMarks: number) {
        if (passingMarks <= 0) {
            throw new BadRequestException('Passing marks must be greater than 0');
        }
        if (passingMarks > totalMarks) {
            throw new BadRequestException('Passing marks cannot exceed total marks');
        }
    }

    // Resolve a ref field to its plain id string, whether or not it was populated
    private extractId(field: any): string {
        return field?._id ? field._id.toString() : field.toString();
    }

    private mapExam(exam: any): ExamData {
        return {
            _id: exam._id.toString(),
            name: exam.name,
            description: exam.description,
            mode: exam.mode,
            status: exam.status,
            batchId: this.extractId(exam.batchId),
            batchName: exam.batchId.batchName || undefined,
            courseId: this.extractId(exam.courseId),
            courseName: exam.courseId.courseName || undefined,
            departmentId: this.extractId(exam.departmentId),
            deptName: exam.departmentId.deptName || undefined,
            sectionId: this.extractId(exam.sectionId),
            sectionName: exam.sectionId.sectionName || undefined,
            semester: exam.semester,
            subjectId: this.extractId(exam.subjectId),
            subjectName: exam.subjectId.subjectName || undefined,
            durationMinutes: exam.durationMinutes,
            totalMarks: exam.totalMarks,
            passingMarks: exam.passingMarks,
            startDate: exam.startDate,
            endDate: exam.endDate,
            startTime: exam.startTime,
            endTime: exam.endTime,
            createdAt: exam.createdAt,
        } as ExamData;
    }

    private mapQuestion(question: any): QuestionData {
        return {
            _id: question._id.toString(),
            type: question.type,
            text: question.text,
            marks: question.marks,
            order: question.order,
            examSectionId: question.examSectionId ? question.examSectionId.toString() : undefined,
            options: question.options,
            correctOptionIds: question.correctOptionIds,
            createdAt: question.createdAt,
        };
    }


    // Create Exam API Endpoint
    async createExamAPI(createExamData: CreateExamRequest, userId?: string) {
        this.validateMarks(createExamData.totalMarks, createExamData.passingMarks);
        this.validateMinTimeSettings(createExamData.durationMinutes, createExamData.securitySettings);
        await this.validateHierarchyAndSchedule(createExamData);

        const exam = await this.examRepositoryService.create({
            name: createExamData.name,
            description: createExamData.description,
            mode: createExamData.mode,
            status: ExamStatus.DRAFT,
            batchId: new Types.ObjectId(createExamData.batchId),
            courseId: new Types.ObjectId(createExamData.courseId),
            departmentId: new Types.ObjectId(createExamData.departmentId),
            sectionId: new Types.ObjectId(createExamData.sectionId),
            semester: createExamData.semester,
            subjectId: new Types.ObjectId(createExamData.subjectId),
            durationMinutes: createExamData.durationMinutes,
            totalMarks: createExamData.totalMarks,
            passingMarks: createExamData.passingMarks,
            startDate: new Date(createExamData.startDate),
            endDate: new Date(createExamData.endDate),
            startTime: createExamData.startTime,
            endTime: createExamData.endTime,
            examSections: (createExamData.examSections || []).map((s) => ({ label: s.label, order: s.order })),
            securitySettings: createExamData.securitySettings as any,
            createdBy: userId ? new Types.ObjectId(userId) : undefined,
        } as any);

        return exam;
    }


    // Get matched (ACTIVE, non-deleted) student count for an exam's hierarchy selection
    private async getMatchedStudentCount(exam: any): Promise<number> {
        const baseFilter = { isActive: true };
        const academicFilter = {
            'academicDetail.batchId': new Types.ObjectId(this.extractId(exam.batchId)),
            'academicDetail.courseId': new Types.ObjectId(this.extractId(exam.courseId)),
            'academicDetail.departmentId': new Types.ObjectId(this.extractId(exam.departmentId)),
            'academicDetail.sectionId': new Types.ObjectId(this.extractId(exam.sectionId)),
            'academicDetail.currentSemester': exam.semester,
            'academicDetail.status': StudentStatus.ACTIVE,
        };
        return this.studentRepositoryService.countWithAcademicFilter(baseFilter, academicFilter);
    }


    // Get matched (ACTIVE, non-deleted) student ids for an exam's hierarchy selection
    private async getMatchedStudentIds(exam: any): Promise<Types.ObjectId[]> {
        const baseFilter = { isActive: true };
        const academicFilter = {
            'academicDetail.batchId': new Types.ObjectId(this.extractId(exam.batchId)),
            'academicDetail.courseId': new Types.ObjectId(this.extractId(exam.courseId)),
            'academicDetail.departmentId': new Types.ObjectId(this.extractId(exam.departmentId)),
            'academicDetail.sectionId': new Types.ObjectId(this.extractId(exam.sectionId)),
            'academicDetail.currentSemester': exam.semester,
            'academicDetail.status': StudentStatus.ACTIVE,
        };
        return this.studentRepositoryService.findAllIdsWithAcademicFilter(baseFilter, academicFilter);
    }


    // Form Exam Rooms API Endpoint — partitions matched students into groups of
    // <=10 and round-robin assigns an active faculty as invigilator for each group.
    // Dynamic Room Allocation: also discovers other unformed PUBLISHED PROCTORING
    // exams sharing this exam's exact schedule window and pools each exam's small
    // leftover remainder together into shared "mixed" rooms, instead of leaving
    // every exam's remainder as its own sparse room.
    async formExamRoomsAPI(examId: string): Promise<FormedRoomData[]> {
        const exam = await this.examRepositoryService.findById(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        if (exam.mode !== ExamMode.PROCTORING) {
            throw new BadRequestException('Rooms can only be formed for PROCTORING exams');
        }
        if (exam.status !== ExamStatus.PUBLISHED) {
            throw new BadRequestException('Exam must be PUBLISHED before forming rooms');
        }

        const existingAssignments = await this.examRoomAssignmentRepositoryService.findByExamId(examId);
        if (existingAssignments.length > 0) {
            throw new ConflictException('Rooms have already been formed for this exam');
        }

        const facultyIds = await this.facultyRepositoryService.findActiveFacultyIds();
        if (facultyIds.length === 0) {
            throw new BadRequestException('No active faculty available to assign as invigilators');
        }

        // Pool set: this exam plus any window-sibling PROCTORING exams that
        // haven't had rooms formed yet (a sibling already formed keeps its own
        // rooms — no retroactive joining of an already-formed room).
        const windowSiblings = await this.examRepositoryService.findMatchingProctoringWindow(
            exam.startDate, exam.endDate, exam.startTime, exam.endTime,
        );
        const poolExams: any[] = [];
        for (const candidate of windowSiblings) {
            const candidateId = (candidate._id as Types.ObjectId).toString();
            if (candidateId === examId) {
                poolExams.push(exam);
                continue;
            }
            const candidateAssignments = await this.examRoomAssignmentRepositoryService.findByExamId(candidateId);
            if (candidateAssignments.length === 0) {
                poolExams.push(candidate);
            }
        }

        type TaggedStudent = { examId: Types.ObjectId; studentId: Types.ObjectId };
        const fullGroups: TaggedStudent[][] = [];
        const leftoverPool: TaggedStudent[] = [];

        for (const poolExam of poolExams) {
            const poolExamId = poolExam._id as Types.ObjectId;
            const studentIds = await this.getMatchedStudentIds(poolExam);
            const tagged = studentIds.map((studentId) => ({ examId: poolExamId, studentId }));

            const fullChunkCount = Math.floor(tagged.length / this.MAX_STUDENTS_PER_ROOM);
            for (let i = 0; i < fullChunkCount; i++) {
                fullGroups.push(tagged.slice(i * this.MAX_STUDENTS_PER_ROOM, (i + 1) * this.MAX_STUDENTS_PER_ROOM));
            }
            leftoverPool.push(...tagged.slice(fullChunkCount * this.MAX_STUDENTS_PER_ROOM));
        }

        const leftoverGroups: TaggedStudent[][] = [];
        for (let i = 0; i < leftoverPool.length; i += this.MAX_STUDENTS_PER_ROOM) {
            leftoverGroups.push(leftoverPool.slice(i, i + this.MAX_STUDENTS_PER_ROOM));
        }

        const allGroups = [...fullGroups, ...leftoverGroups];
        if (allGroups.length === 0) {
            throw new BadRequestException('No students matched this exam\'s (or its window-siblings\') hierarchy selection');
        }

        const startDateTime = combineDateTimeIST(exam.startDate, exam.startTime as string);
        const endDateTime = combineDateTimeIST(exam.endDate, exam.endTime as string);

        const roomsToCreate = allGroups.map((group, index) => {
            const distinctExamIds = [...new Set(group.map((g) => g.examId.toString()))];
            return {
                examId: distinctExamIds.length === 1 ? new Types.ObjectId(distinctExamIds[0]) : undefined,
                facultyId: facultyIds[index % facultyIds.length],
                startDateTime,
                endDateTime,
                durationMinutes: exam.durationMinutes,
                liveKitSessionId: `exam-room-${examId}-${index}`,
                status: ExamRoomStatus.SCHEDULED,
            };
        });

        const createdRooms = await this.examRoomRepositoryService.createMany(roomsToCreate as any);

        const assignmentsToCreate = createdRooms.flatMap((room, index) =>
            allGroups[index].map((tagged) => ({
                roomId: room._id as Types.ObjectId,
                examId: tagged.examId,
                studentId: tagged.studentId,
                status: RoomAssignmentStatus.WAITING,
            })),
        );
        await this.examRoomAssignmentRepositoryService.createMany(assignmentsToCreate as any);

        const faculties = await this.facultyRepositoryService.findByIdsPreserveOrder(
            createdRooms.map((room) => room.facultyId),
        );
        const facultyCodeById = new Map(faculties.map((f) => [(f._id as Types.ObjectId).toString(), f.facultyId]));
        const examNameById = new Map(poolExams.map((e) => [(e._id as Types.ObjectId).toString(), e.name]));

        return createdRooms.map((room, index) => ({
            roomId: (room._id as Types.ObjectId).toString(),
            facultyId: room.facultyId.toString(),
            facultyCode: facultyCodeById.get(room.facultyId.toString()) || '',
            liveKitSessionId: room.liveKitSessionId,
            studentCount: allGroups[index].length,
            pooledExamNames: [...new Set(allGroups[index].map((g) => examNameById.get(g.examId.toString()) || ''))],
        }));
    }


    // Get Exam Rooms API Endpoint — lists formed rooms with assignment status counts
    async getExamRoomsAPI(examId: string): Promise<ExamRoomSummaryData[]> {
        const exam = await this.examRepositoryService.findById(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        // A pooled room's own examId may be unset — find this exam's rooms via
        // its assignments' distinct roomIds instead of a room-level examId match.
        const examAssignments = await this.examRoomAssignmentRepositoryService.findByExamId(examId);
        const roomIds = [...new Set(examAssignments.map((a) => (a.roomId as Types.ObjectId).toString()))].map(
            (id) => new Types.ObjectId(id),
        );
        const rooms = await this.examRoomRepositoryService.findByIds(roomIds);

        const faculties = await this.facultyRepositoryService.findByIdsPreserveOrder(
            rooms.map((room) => room.facultyId),
        );
        const facultyCodeById = new Map(faculties.map((f) => [(f._id as Types.ObjectId).toString(), f.facultyId]));
        const facultyDetailById = await this.resolveFacultyDetails(faculties);

        // Load every room's assignments up front so student/exam identity can
        // be resolved in one batch each, instead of once per room.
        const assignmentsByRoomId = new Map(
            await Promise.all(rooms.map(async (room) => {
                const assignments = await this.examRoomAssignmentRepositoryService.findByRoomId(room._id as Types.ObjectId);
                return [(room._id as Types.ObjectId).toString(), assignments] as const;
            })),
        );
        const allAssignmentsFlat = [...assignmentsByRoomId.values()].flat();

        const allStudents = await this.studentRepositoryService.findByIdsPreserveOrder(
            [...new Set(allAssignmentsFlat.map((a) => a.studentId.toString()))].map((id) => new Types.ObjectId(id)),
        );
        const studentCodeById = new Map(allStudents.map((s) => [(s._id as Types.ObjectId).toString(), s.studentId]));
        const studentDetailById = await this.resolveStudentDetails(allStudents);

        const examNameById = new Map<string, string>([[examId, exam.name]]);
        const otherExamIds = [...new Set(allAssignmentsFlat.map((a) => a.examId.toString()))].filter((id) => id !== examId);
        if (otherExamIds.length > 0) {
            const otherExams = await Promise.all(otherExamIds.map((id) => this.examRepositoryService.findByIdRaw(id)));
            otherExamIds.forEach((id, index) => {
                if (otherExams[index]) examNameById.set(id, otherExams[index]!.name);
            });
        }

        const summaries: ExamRoomSummaryData[] = [];
        for (const room of rooms) {
            const roomIdStr = (room._id as Types.ObjectId).toString();
            const allAssignments = assignmentsByRoomId.get(roomIdStr) || [];
            const thisExamAssignments = allAssignments.filter((a) => a.examId.toString() === examId);

            const waitingCount = thisExamAssignments.filter((a) => a.status === RoomAssignmentStatus.WAITING).length;
            const admittedCount = thisExamAssignments.filter((a) => a.status === RoomAssignmentStatus.ADMITTED).length;
            const inProgressCount = thisExamAssignments.filter((a) => a.status === RoomAssignmentStatus.IN_PROGRESS).length;
            const completedCount = thisExamAssignments.filter((a) => a.status === RoomAssignmentStatus.COMPLETED).length;
            const removedOrRejectedCount = thisExamAssignments.filter(
                (a) => a.status === RoomAssignmentStatus.REJECTED || a.status === RoomAssignmentStatus.REMOVED,
            ).length;

            const pooledWithExamNames = [...new Set(
                allAssignments
                    .filter((a) => a.examId.toString() !== examId)
                    .map((a) => examNameById.get(a.examId.toString()) || ''),
            )].filter(Boolean);

            const assignments: RoomAssignmentDetailData[] = allAssignments.map((a) => {
                const studentIdStr = a.studentId.toString();
                const studentDetail = studentDetailById.get(studentIdStr);
                return {
                    assignmentId: (a._id as Types.ObjectId).toString(),
                    examId: a.examId.toString(),
                    examName: examNameById.get(a.examId.toString()) || '',
                    studentId: studentIdStr,
                    studentCode: studentCodeById.get(studentIdStr) || '',
                    studentName: studentDetail?.name || '',
                    studentEmail: studentDetail?.email || '',
                    status: a.status,
                    enteredWaitingRoomAt: a.enteredWaitingRoomAt,
                    admittedAt: a.admittedAt,
                    removedAt: a.removedAt,
                    removalReason: a.removalReason,
                };
            });

            const facultyDetail = facultyDetailById.get(room.facultyId.toString());

            summaries.push({
                roomId: roomIdStr,
                facultyId: room.facultyId.toString(),
                facultyCode: facultyCodeById.get(room.facultyId.toString()) || '',
                facultyName: facultyDetail?.name || '',
                facultyEmail: facultyDetail?.email || '',
                liveKitSessionId: room.liveKitSessionId,
                startDateTime: room.startDateTime,
                endDateTime: room.endDateTime,
                status: room.status,
                waitingCount,
                admittedCount,
                inProgressCount,
                completedCount,
                removedOrRejectedCount,
                totalCount: thisExamAssignments.length,
                roomTotalOccupancy: allAssignments.length,
                pooledWithExamNames,
                assignments,
            });
        }

        return summaries;
    }


    // Get All Exam Rooms Overview API Endpoint — every room across every
    // exam, for the admin "Exam Room Allocation" monitoring page
    async getAllExamRoomsOverviewAPI(query: GetAllExamRoomsRequest): Promise<{
        rooms: RoomOverviewData[];
        pagination: RoomPaginationMeta;
        statusCounts: { upcoming: number; inProgress: number; completed: number };
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const [totalItems, upcomingCount, inProgressCount, completedCount, rooms] = await Promise.all([
            this.examRoomRepositoryService.countAllRooms(query.effectiveStatus),
            this.examRoomRepositoryService.countAllRooms('UPCOMING'),
            this.examRoomRepositoryService.countAllRooms('IN_PROGRESS'),
            this.examRoomRepositoryService.countAllRooms('COMPLETED'),
            this.examRoomRepositoryService.findAllRooms(query.effectiveStatus, skip, limit),
        ]);

        const faculties = await this.facultyRepositoryService.findByIdsPreserveOrder(
            rooms.map((room) => room.facultyId),
        );
        const facultyCodeById = new Map(faculties.map((f) => [(f._id as Types.ObjectId).toString(), f.facultyId]));
        const facultyDetailById = await this.resolveFacultyDetails(faculties);

        const assignmentsByRoomId = new Map(
            await Promise.all(rooms.map(async (room) => {
                const assignments = await this.examRoomAssignmentRepositoryService.findByRoomId(room._id as Types.ObjectId);
                return [(room._id as Types.ObjectId).toString(), assignments] as const;
            })),
        );
        const allAssignmentsFlat = [...assignmentsByRoomId.values()].flat();

        const allStudents = await this.studentRepositoryService.findByIdsPreserveOrder(
            [...new Set(allAssignmentsFlat.map((a) => a.studentId.toString()))].map((id) => new Types.ObjectId(id)),
        );
        const studentCodeById = new Map(allStudents.map((s) => [(s._id as Types.ObjectId).toString(), s.studentId]));
        const studentDetailById = await this.resolveStudentDetails(allStudents);

        const distinctExamIds = [...new Set(allAssignmentsFlat.map((a) => a.examId.toString()))];
        const examNameById = new Map<string, string>();
        if (distinctExamIds.length > 0) {
            const examDocs = await Promise.all(distinctExamIds.map((id) => this.examRepositoryService.findByIdRaw(id)));
            distinctExamIds.forEach((id, index) => {
                if (examDocs[index]) examNameById.set(id, examDocs[index]!.name);
            });
        }

        const now = Date.now();
        const roomsData: RoomOverviewData[] = rooms.map((room) => {
            const roomIdStr = (room._id as Types.ObjectId).toString();
            const assignments = assignmentsByRoomId.get(roomIdStr) || [];

            const waitingCount = assignments.filter((a) => a.status === RoomAssignmentStatus.WAITING).length;
            const admittedCount = assignments.filter((a) => a.status === RoomAssignmentStatus.ADMITTED).length;
            const inProgressCount = assignments.filter((a) => a.status === RoomAssignmentStatus.IN_PROGRESS).length;
            const completedCount = assignments.filter((a) => a.status === RoomAssignmentStatus.COMPLETED).length;
            const removedOrRejectedCount = assignments.filter(
                (a) => a.status === RoomAssignmentStatus.REJECTED || a.status === RoomAssignmentStatus.REMOVED,
            ).length;

            const startMs = new Date(room.startDateTime).getTime();
            const endMs = new Date(room.endDateTime).getTime();
            const effectiveStatus: RoomOverviewData['effectiveStatus'] =
                now < startMs ? 'UPCOMING' : now < endMs ? 'IN_PROGRESS' : 'COMPLETED';

            const facultyDetail = facultyDetailById.get(room.facultyId.toString());

            return {
                roomId: roomIdStr,
                facultyId: room.facultyId.toString(),
                facultyCode: facultyCodeById.get(room.facultyId.toString()) || '',
                facultyName: facultyDetail?.name || '',
                facultyEmail: facultyDetail?.email || '',
                liveKitSessionId: room.liveKitSessionId,
                startDateTime: room.startDateTime,
                endDateTime: room.endDateTime,
                durationMinutes: room.durationMinutes,
                status: room.status,
                effectiveStatus,
                examNames: [...new Set(assignments.map((a) => examNameById.get(a.examId.toString()) || ''))].filter(Boolean),
                waitingCount,
                admittedCount,
                inProgressCount,
                completedCount,
                removedOrRejectedCount,
                totalOccupancy: assignments.length,
                assignments: assignments.map((a) => {
                    const studentIdStr = a.studentId.toString();
                    const studentDetail = studentDetailById.get(studentIdStr);
                    return {
                        assignmentId: (a._id as Types.ObjectId).toString(),
                        examId: a.examId.toString(),
                        examName: examNameById.get(a.examId.toString()) || '',
                        studentId: studentIdStr,
                        studentCode: studentCodeById.get(studentIdStr) || '',
                        studentName: studentDetail?.name || '',
                        studentEmail: studentDetail?.email || '',
                        status: a.status,
                        enteredWaitingRoomAt: a.enteredWaitingRoomAt,
                        admittedAt: a.admittedAt,
                        removedAt: a.removedAt,
                        removalReason: a.removalReason,
                    };
                }),
            };
        });

        const totalPages = Math.ceil(totalItems / limit) || 1;

        return {
            rooms: roomsData,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            statusCounts: { upcoming: upcomingCount, inProgress: inProgressCount, completed: completedCount },
        };
    }


    // Get Attempt Recording API Endpoint — video/screen chunk streams
    // for one attempt, for the admin recording-review viewer. Recordings are
    // client-self-reported (no server-side verification against Cloudinary —
    // see ExamAttemptService.recordChunkAPI/finalizeRecordingAPI), so a
    // stream with status UPLOAD_COMPLETE is not a guarantee its chunk URLs
    // still resolve.
    async getAttemptRecordingAPI(attemptId: string): Promise<AttemptRecordingData> {
        const attempt = await this.examAttemptRepositoryService.findById(attemptId);
        if (!attempt) throw new NotFoundException('Attempt not found');

        const [exam, students, recording] = await Promise.all([
            this.examRepositoryService.findByIdRaw(attempt.examId.toString()),
            this.studentRepositoryService.findByIdsPreserveOrder([attempt.studentId]),
            this.examRecordingRepositoryService.findByAttemptId(attemptId),
        ]);
        if (!exam) throw new NotFoundException('Exam not found');

        const student = students[0];
        const studentDetail = student ? (await this.resolveStudentDetails([student])).get((student._id as Types.ObjectId).toString()) : undefined;

        const emptyStream = () => ({ status: MediaStatus.PENDING_UPLOAD, chunks: [] });
        const mapStream = (stream?: { status: string; chunks: { sequence: number; cloudinaryUrl: string; uploadedAt: Date }[] }) =>
            stream
                ? {
                    status: stream.status,
                    chunks: [...stream.chunks].sort((a, b) => a.sequence - b.sequence).map((c) => ({
                        sequence: c.sequence,
                        cloudinaryUrl: c.cloudinaryUrl,
                        uploadedAt: c.uploadedAt,
                    })),
                }
                : emptyStream();

        return {
            attemptId,
            examId: attempt.examId.toString(),
            examName: exam.name,
            studentId: attempt.studentId.toString(),
            studentCode: student?.studentId || '',
            studentName: studentDetail?.name || '',
            studentEmail: studentDetail?.email || '',
            attemptStatus: attempt.status,
            mediaStatus: attempt.mediaStatus || MediaStatus.PENDING_UPLOAD,
            video: mapStream(recording?.video),
            screen: mapStream(recording?.screen),
        };
    }


    private isAnswerCorrect(question: any, answer: any): boolean {
        if (!answer) return false;
        if (question.type === QuestionType.MCQ) {
            return !!answer.selectedOptionId && (question.correctOptionIds || []).includes(answer.selectedOptionId);
        }
        if (question.type === QuestionType.MSQ) {
            const selected: string[] = answer.selectedOptionIds || [];
            const correct: string[] = question.correctOptionIds || [];
            return selected.length === correct.length && selected.every((id) => correct.includes(id));
        }
        return false;
    }


    // Get Attempt Answers API Endpoint — every question in the exam alongside
    // this attempt's answer (MCQ/MSQ selections resolved to option text +
    // correctness, WRITTEN pages, TYPING text), for the admin per-attempt
    // review view. Unlike the faculty evaluation queue, this is admin-only,
    // covers every question type, and isn't scoped to a single evaluator.
    async getAttemptAnswersAPI(attemptId: string): Promise<AttemptQuestionAnswerData[]> {
        const attempt = await this.examAttemptRepositoryService.findById(attemptId);
        if (!attempt) throw new NotFoundException('Attempt not found');

        const [questions, answers] = await Promise.all([
            this.examQuestionRepositoryService.findByExamId(attempt.examId.toString()),
            this.examAnswerRepositoryService.findByAttemptId(attemptId),
        ]);
        const answerByQuestionId = new Map(answers.map((a) => [a.questionId.toString(), a]));

        return questions.map((question) => {
            const questionId = (question._id as Types.ObjectId).toString();
            const answer = answerByQuestionId.get(questionId);
            const optionById = new Map((question.options || []).map((o) => [o.optionId, o.text]));

            return {
                questionId,
                type: question.type,
                text: question.text,
                marks: question.marks,
                order: question.order,
                examSectionId: question.examSectionId ? question.examSectionId.toString() : undefined,
                selectedOptionText: answer?.selectedOptionId ? optionById.get(answer.selectedOptionId) : undefined,
                selectedOptionTexts: answer?.selectedOptionIds?.map((id) => optionById.get(id)).filter((t): t is string => !!t),
                isCorrect: (question.type === QuestionType.MCQ || question.type === QuestionType.MSQ)
                    ? this.isAnswerCorrect(question, answer)
                    : undefined,
                pages: answer?.pages,
                answerText: answer?.answerText,
                marksAwarded: answer?.marksAwarded,
                remarks: answer?.remarks,
            };
        });
    }


    // Get Exam By Id API Endpoint
    async getExamByIdAPI(examId: string): Promise<ExamDetailData> {
        const exam = await this.examRepositoryService.findById(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        const questions = await this.examQuestionRepositoryService.findByExamId(examId);
        const totalQuestionMarks = await this.examQuestionRepositoryService.sumMarksByExamId(examId);
        const matchedStudentCount = await this.getMatchedStudentCount(exam);

        return {
            ...this.mapExam(exam),
            evaluatorFacultyIds: (exam.evaluatorFacultyIds || []).map((id: any) => id.toString()),
            securitySettings: exam.securitySettings as any,
            examSections: (exam.examSections || []).map((s: any) => ({
                _id: s._id.toString(),
                label: s.label,
                order: s.order,
            })),
            questions: questions.map((q) => this.mapQuestion(q)),
            totalQuestionMarks,
            matchedStudentCount,
        };
    }


    // Get All Exams API Endpoint
    async getAllExamsAPI(query: GetAllExamsRequest): Promise<{ exams: ExamData[]; pagination: PaginationMeta }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const filters = {
            mode: query.mode,
            status: query.status,
            batchId: query.batchId,
            courseId: query.courseId,
            departmentId: query.departmentId,
            search: query.search,
        };

        const totalItems = await this.examRepositoryService.countWithFilters(filters);
        const exams = await this.examRepositoryService.findAllWithFilters(
            filters,
            skip,
            limit,
            query.sortBy,
            query.sortOrder || 'desc',
        );

        const totalPages = Math.ceil(totalItems / limit);

        return {
            exams: exams.map((exam) => this.mapExam(exam)),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }


    // Edit Exam API Endpoint
    async editExamAPI(examId: string, data: EditExamRequest, userId?: string): Promise<void> {
        const exam = await this.examRepositoryService.findById(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        if (exam.status === ExamStatus.DRAFT) {
            const merged = {
                batchId: data.batchId ?? this.extractId(exam.batchId),
                courseId: data.courseId ?? this.extractId(exam.courseId),
                departmentId: data.departmentId ?? this.extractId(exam.departmentId),
                sectionId: data.sectionId ?? this.extractId(exam.sectionId),
                semester: data.semester ?? exam.semester,
                subjectId: data.subjectId ?? this.extractId(exam.subjectId),
                mode: data.mode ?? exam.mode,
                durationMinutes: data.durationMinutes ?? exam.durationMinutes,
                startDate: data.startDate ?? exam.startDate.toISOString(),
                endDate: data.endDate ?? exam.endDate.toISOString(),
                startTime: data.startTime ?? exam.startTime,
                endTime: data.endTime ?? exam.endTime,
            };
            await this.validateHierarchyAndSchedule(merged);
            this.validateMarks(data.totalMarks ?? exam.totalMarks, data.passingMarks ?? exam.passingMarks);
            this.validateMinTimeSettings(
                data.durationMinutes ?? exam.durationMinutes,
                (data.securitySettings ?? exam.securitySettings) as any,
            );

            const updatePayload: any = { ...data, updatedBy: userId ? new Types.ObjectId(userId) : undefined };
            if (data.batchId) updatePayload.batchId = new Types.ObjectId(data.batchId);
            if (data.courseId) updatePayload.courseId = new Types.ObjectId(data.courseId);
            if (data.departmentId) updatePayload.departmentId = new Types.ObjectId(data.departmentId);
            if (data.sectionId) updatePayload.sectionId = new Types.ObjectId(data.sectionId);
            if (data.subjectId) updatePayload.subjectId = new Types.ObjectId(data.subjectId);
            if (data.startDate) updatePayload.startDate = new Date(data.startDate);
            if (data.endDate) updatePayload.endDate = new Date(data.endDate);

            await this.examRepositoryService.updateById(examId, updatePayload);
            return;
        }

        if (exam.status === ExamStatus.PUBLISHED) {
            const disallowedFields = Object.keys(data).filter(
                (key) => key !== 'description' && (data as any)[key] !== undefined,
            );
            if (disallowedFields.length > 0) {
                throw new ForbiddenException(
                    `Cannot edit ${disallowedFields.join(', ')} once the exam is published — only Description can be updated`,
                );
            }
            await this.examRepositoryService.updateById(examId, {
                description: data.description,
                updatedBy: userId ? new Types.ObjectId(userId) : undefined,
            } as any);
            return;
        }

        throw new ForbiddenException(`Exam cannot be edited while ${exam.status}`);
    }


    // Publish Exam API Endpoint
    async publishExamAPI(examId: string): Promise<void> {
        const exam = await this.examRepositoryService.findById(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        if (exam.status !== ExamStatus.DRAFT) {
            throw new ConflictException('Only a DRAFT exam can be published');
        }

        const questionCount = await this.examQuestionRepositoryService.countByExamId(examId);
        if (questionCount < 1) {
            throw new BadRequestException('At least 1 question is required to publish');
        }

        const sumMarks = await this.examQuestionRepositoryService.sumMarksByExamId(examId);
        if (sumMarks !== exam.totalMarks) {
            throw new BadRequestException(
                `Total marks (${exam.totalMarks}) does not match the sum of question marks (${sumMarks})`,
            );
        }

        this.validateMarks(exam.totalMarks, exam.passingMarks);

        await this.validateHierarchyAndSchedule({
            batchId: this.extractId(exam.batchId),
            courseId: this.extractId(exam.courseId),
            departmentId: this.extractId(exam.departmentId),
            sectionId: this.extractId(exam.sectionId),
            semester: exam.semester,
            subjectId: this.extractId(exam.subjectId),
            mode: exam.mode,
            durationMinutes: exam.durationMinutes,
            startDate: exam.startDate.toISOString(),
            endDate: exam.endDate.toISOString(),
            startTime: exam.startTime,
            endTime: exam.endTime,
        });

        await this.examRepositoryService.updateById(examId, { status: ExamStatus.PUBLISHED } as any);
    }


    // Cancel (soft-delete) Exam API Endpoint
    async cancelExamAPI(examId: string): Promise<void> {
        const exam = await this.examRepositoryService.findById(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        if (exam.status !== ExamStatus.DRAFT && exam.status !== ExamStatus.PUBLISHED) {
            throw new ForbiddenException(`Exam cannot be cancelled while ${exam.status}`);
        }

        await this.examRepositoryService.softDeleteById(examId);
    }


    private buildOptionsAndCorrectIds(type: QuestionType, options?: { text: string; isCorrect: boolean }[]) {
        if (SUBJECTIVE_TYPES.includes(type)) {
            return { options: undefined, correctOptionIds: undefined };
        }

        const built = (options || []).map((opt) => ({ optionId: ulid(), text: opt.text }));
        const correctOptionIds = built
            .filter((_, index) => options![index].isCorrect)
            .map((opt) => opt.optionId);

        if (type === QuestionType.MCQ && correctOptionIds.length !== 1) {
            throw new BadRequestException('MCQ questions must have exactly 1 correct option');
        }
        if (type === QuestionType.MSQ && correctOptionIds.length < 1) {
            throw new BadRequestException('MSQ questions must have at least 1 correct option');
        }

        return { options: built, correctOptionIds };
    }

    private assertExamIsDraft(exam: any) {
        if (!exam) throw new NotFoundException('Exam not found');
        if (exam.status !== ExamStatus.DRAFT) {
            throw new ForbiddenException('Questions can only be managed while the exam is in DRAFT');
        }
    }


    // A provided examSectionId must reference one of the exam's own examSections
    private assertValidExamSection(exam: any, examSectionId?: string) {
        if (!examSectionId) return;
        const exists = (exam.examSections || []).some((s: any) => s._id.toString() === examSectionId);
        if (!exists) {
            throw new BadRequestException('examSectionId does not belong to this exam');
        }
    }


    // Add Question API Endpoint
    async addQuestionAPI(examId: string, data: AddQuestionRequest, userId?: string): Promise<QuestionData> {
        const exam = await this.examRepositoryService.findById(examId);
        this.assertExamIsDraft(exam);
        this.assertValidExamSection(exam, data.examSectionId);

        if (SUBJECTIVE_TYPES.includes(data.type)) {
            if (data.marks < MIN_WRITTEN_MARKS || data.marks > MAX_WRITTEN_MARKS) {
                throw new BadRequestException(`Written/Typing questions must be worth between ${MIN_WRITTEN_MARKS} and ${MAX_WRITTEN_MARKS} marks`);
            }
        }

        const { options, correctOptionIds } = this.buildOptionsAndCorrectIds(data.type, data.options);
        const order = await this.examQuestionRepositoryService.getNextOrder(examId);

        const question = await this.examQuestionRepositoryService.create({
            examId: new Types.ObjectId(examId),
            type: data.type,
            text: data.text,
            marks: data.marks,
            order,
            examSectionId: data.examSectionId ? new Types.ObjectId(data.examSectionId) : undefined,
            options,
            correctOptionIds,
            createdBy: userId ? new Types.ObjectId(userId) : undefined,
        } as any);

        return this.mapQuestion(question);
    }


    // Bulk Upload Questions API Endpoint — CSV-parsed rows from the client,
    // each validated/created the same way as a single addQuestionAPI call.
    // No cross-row transaction: question creation touches a single
    // collection, so a failed row just gets recorded and skipped.
    async bulkUploadQuestionsAPI(examId: string, data: { questions: AddQuestionRequest[] }, userId?: string) {
        const exam = await this.examRepositoryService.findById(examId);
        this.assertExamIsDraft(exam);

        const successfulUploads: { rowNumber: number; questionId?: string; status: 'success' | 'failed'; error?: string }[] = [];
        const failedUploads: { rowNumber: number; questionId?: string; status: 'success' | 'failed'; error?: string }[] = [];

        for (let i = 0; i < data.questions.length; i++) {
            const rowNumber = i + 1;
            try {
                const question = await this.addQuestionAPI(examId, data.questions[i], userId);
                successfulUploads.push({ rowNumber, questionId: question._id, status: 'success' });
            } catch (error: any) {
                failedUploads.push({ rowNumber, status: 'failed', error: error?.message || 'Failed to create question' });
            }
        }

        return {
            totalRecords: data.questions.length,
            successCount: successfulUploads.length,
            failedCount: failedUploads.length,
            successfulUploads,
            failedUploads,
        };
    }


    // Edit Question API Endpoint
    async editQuestionAPI(examId: string, questionId: string, data: EditQuestionRequest, userId?: string): Promise<void> {
        const exam = await this.examRepositoryService.findById(examId);
        this.assertExamIsDraft(exam);
        this.assertValidExamSection(exam, data.examSectionId);

        const question = await this.examQuestionRepositoryService.findById(questionId);
        if (!question || question.examId.toString() !== examId) {
            throw new NotFoundException('Question not found');
        }

        const type = data.type ?? (question.type as QuestionType);
        const marks = data.marks ?? question.marks;

        if (SUBJECTIVE_TYPES.includes(type) && (marks < MIN_WRITTEN_MARKS || marks > MAX_WRITTEN_MARKS)) {
            throw new BadRequestException(`Written/Typing questions must be worth between ${MIN_WRITTEN_MARKS} and ${MAX_WRITTEN_MARKS} marks`);
        }

        const updatePayload: any = {
            type,
            text: data.text ?? question.text,
            marks,
            updatedBy: userId ? new Types.ObjectId(userId) : undefined,
        };

        if (data.examSectionId !== undefined) {
            updatePayload.examSectionId = new Types.ObjectId(data.examSectionId);
        }

        if (data.options || type !== question.type) {
            const { options, correctOptionIds } = this.buildOptionsAndCorrectIds(type, data.options);
            updatePayload.options = options;
            updatePayload.correctOptionIds = correctOptionIds;
        }

        await this.examQuestionRepositoryService.updateById(questionId, updatePayload);
    }


    // Delete Question API Endpoint
    async deleteQuestionAPI(examId: string, questionId: string): Promise<void> {
        const exam = await this.examRepositoryService.findById(examId);
        this.assertExamIsDraft(exam);

        const question = await this.examQuestionRepositoryService.findById(questionId);
        if (!question || question.examId.toString() !== examId) {
            throw new NotFoundException('Question not found');
        }

        await this.examQuestionRepositoryService.softDeleteById(questionId);
    }


    // Gather everything needed to score/gate evaluation for an exam in one pass:
    // its WRITTEN question ids, every terminal (SUBMITTED/COMPLETED) attempt, and
    // every answer across those attempts, batched to avoid N+1 queries.
    private async computeEvaluationState(examId: string) {
        const questions = await this.examQuestionRepositoryService.findByExamId(examId);
        const writtenQuestionIds = questions
            .filter((q) => q.type === QuestionType.WRITTEN)
            .map((q) => (q._id as Types.ObjectId).toString());

        const allAttempts = await this.examAttemptRepositoryService.findAllByExamId(examId);
        const terminalAttempts = allAttempts.filter(
            (a) => a.status === AttemptStatus.SUBMITTED || a.status === AttemptStatus.COMPLETED,
        );

        const attemptIds = terminalAttempts.map((a) => (a._id as Types.ObjectId).toString());
        const allAnswers = attemptIds.length > 0
            ? await this.examAnswerRepositoryService.findByAttemptIds(attemptIds)
            : [];

        const answersByAttemptId = new Map<string, any[]>();
        for (const answer of allAnswers) {
            const key = answer.attemptId.toString();
            if (!answersByAttemptId.has(key)) answersByAttemptId.set(key, []);
            answersByAttemptId.get(key)!.push(answer);
        }

        const writtenAnswers = allAnswers.filter((a) => writtenQuestionIds.includes(a.questionId.toString()));
        const evaluatedCount = writtenAnswers.filter((a) => a.marksAwarded !== undefined && a.marksAwarded !== null).length;

        return {
            writtenQuestionIds,
            attempts: terminalAttempts,
            answersByAttemptId,
            totalWrittenAnswers: writtenAnswers.length,
            evaluatedCount,
            pendingCount: writtenAnswers.length - evaluatedCount,
        };
    }


    // Assign Evaluators API Endpoint
    async assignEvaluatorsAPI(examId: string, evaluatorFacultyIds: string[]): Promise<void> {
        const exam = await this.examRepositoryService.findByIdRaw(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        if (exam.status === ExamStatus.RESULTS_PUBLISHED) {
            throw new ForbiddenException('Cannot change evaluators after results have been published');
        }

        if (evaluatorFacultyIds.length > 0) {
            const faculties = await this.facultyRepositoryService.findByIdsPreserveOrder(
                evaluatorFacultyIds.map((id) => new Types.ObjectId(id)),
            );
            if (faculties.length !== evaluatorFacultyIds.length) {
                throw new NotFoundException('One or more selected faculty could not be found');
            }
        }

        await this.examRepositoryService.updateById(examId, {
            evaluatorFacultyIds: evaluatorFacultyIds.map((id) => new Types.ObjectId(id)),
        } as any);
    }


    // Get Exam Attempts API Endpoint — every attempt for this exam with its
    // integrity violation summary, for the admin's "Attempts & Integrity" view
    async getExamAttemptsAPI(examId: string): Promise<ExamAttemptSummaryData[]> {
        const exam = await this.examRepositoryService.findByIdRaw(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        const attempts = await this.examAttemptRepositoryService.findAllByExamId(examId);
        const students = await this.studentRepositoryService.findByIdsPreserveOrder(
            attempts.map((a) => a.studentId),
        );
        const studentCodeById = new Map(students.map((s) => [(s._id as Types.ObjectId).toString(), s.studentId]));
        const studentDetailById = await this.resolveStudentDetails(students);

        return attempts.map((attempt) => {
            const violationCounts: Record<string, number> = {};
            for (const violation of attempt.violations || []) {
                violationCounts[violation.type] = (violationCounts[violation.type] || 0) + 1;
            }
            const detail = studentDetailById.get(attempt.studentId.toString());
            return {
                attemptId: (attempt._id as Types.ObjectId).toString(),
                studentId: attempt.studentId.toString(),
                studentCode: studentCodeById.get(attempt.studentId.toString()) || '',
                studentName: detail?.name || '',
                studentEmail: detail?.email || '',
                status: attempt.status,
                isFlagged: attempt.isFlagged,
                violationCounts,
                totalScore: attempt.totalScore,
                passed: attempt.passed,
            };
        });
    }


    // Resolves {name, email} for a batch of student documents, keyed by
    // student _id — batches the personal-detail/contact-info lookups instead
    // of one query per student
    private async resolveStudentDetails(
        students: { _id: any; personalDetailId: Types.ObjectId; contactInformationId: Types.ObjectId }[],
    ): Promise<Map<string, { name: string; email: string }>> {
        const personalDetails = await this.studentPersonalDetailRepositoryService.findByIds(
            students.map((s) => s.personalDetailId),
        );
        const contactInfos = await this.studentContactInformationRepositoryService.findByIds(
            students.map((s) => s.contactInformationId),
        );
        const personalById = new Map(personalDetails.map((p) => [(p._id as Types.ObjectId).toString(), p]));
        const contactById = new Map(contactInfos.map((c) => [(c._id as Types.ObjectId).toString(), c]));

        return new Map(students.map((s) => {
            const personal = personalById.get(s.personalDetailId.toString());
            const contact = contactById.get(s.contactInformationId.toString());
            return [
                (s._id as Types.ObjectId).toString(),
                {
                    name: personal ? `${personal.firstName} ${personal.lastName}` : '',
                    email: contact?.studentEmail || '',
                },
            ];
        }));
    }


    // Resolves {name, email} for a batch of faculty documents, keyed by
    // faculty _id — same batching rationale as resolveStudentDetails
    private async resolveFacultyDetails(
        faculties: { _id: any; personalDetailId: Types.ObjectId; contactInformationId: Types.ObjectId }[],
    ): Promise<Map<string, { name: string; email: string }>> {
        const personalDetails = await this.facultyPersonalDetailRepositoryService.findByIds(
            faculties.map((f) => f.personalDetailId),
        );
        const contactInfos = await this.facultyContactInformationRepositoryService.findByIds(
            faculties.map((f) => f.contactInformationId),
        );
        const personalById = new Map(personalDetails.map((p) => [(p._id as Types.ObjectId).toString(), p]));
        const contactById = new Map(contactInfos.map((c) => [(c._id as Types.ObjectId).toString(), c]));

        return new Map(faculties.map((f) => {
            const personal = personalById.get(f.personalDetailId.toString());
            const contact = contactById.get(f.contactInformationId.toString());
            return [
                (f._id as Types.ObjectId).toString(),
                {
                    name: personal ? `${personal.firstName} ${personal.lastName}` : '',
                    email: contact?.facultyEmail || '',
                },
            ];
        }));
    }


    // Get Evaluation Progress API Endpoint
    async getEvaluationProgressAPI(examId: string): Promise<EvaluationProgressData> {
        const exam = await this.examRepositoryService.findByIdRaw(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        const state = await this.computeEvaluationState(examId);
        return {
            totalWrittenAnswers: state.totalWrittenAnswers,
            evaluatedCount: state.evaluatedCount,
            pendingCount: state.pendingCount,
        };
    }


    // Publish Results API Endpoint — gated on every WRITTEN answer being graded;
    // computes each attempt's final writtenScore/totalScore/passed and opens results to students
    async publishResultsAPI(examId: string): Promise<void> {
        const exam = await this.examRepositoryService.findByIdRaw(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        if (exam.status !== ExamStatus.COMPLETED) {
            throw new ConflictException('Exam must be COMPLETED before results can be published');
        }

        const state = await this.computeEvaluationState(examId);
        if (state.pendingCount > 0) {
            throw new BadRequestException(
                `${state.evaluatedCount} of ${state.totalWrittenAnswers} written answers graded — please finish grading before publishing`,
            );
        }

        for (const attempt of state.attempts) {
            const attemptId = (attempt._id as Types.ObjectId).toString();
            const answers = state.answersByAttemptId.get(attemptId) || [];
            const writtenScore = answers
                .filter((a) => state.writtenQuestionIds.includes(a.questionId.toString()))
                .reduce((sum, a) => sum + (a.marksAwarded || 0), 0);
            const objectiveScore = attempt.objectiveScore || 0;
            const totalScore = objectiveScore + writtenScore;
            const passed = totalScore >= exam.passingMarks;

            await this.examAttemptRepositoryService.updateById(attemptId, {
                writtenScore,
                totalScore,
                passed,
            } as any);
        }

        await this.examRepositoryService.updateById(examId, { status: ExamStatus.RESULTS_PUBLISHED } as any);
    }

}
