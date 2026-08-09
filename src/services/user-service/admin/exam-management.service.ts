import { Types } from 'mongoose';
import { ulid } from 'ulid';
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { AttemptStatus, ExamMode, ExamRoomStatus, ExamStatus, QuestionType, RoomAssignmentStatus, StudentStatus } from 'src/utils/enum';

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
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamQuestionRepositoryService } from 'src/repositories/exam-question-repository/exam-question.repository';
import { FacultyRepositoryService } from 'src/repositories/faculty-repository/faculty.repository';
import { ExamRoomRepositoryService } from 'src/repositories/exam-room-repository/exam-room.repository';
import { ExamRoomAssignmentRepositoryService } from 'src/repositories/exam-room-assignment-repository/exam-room-assignment.repository';
import { FormedRoomData } from 'src/api/user/admin/exam-management/form-exam-rooms/form-exam-rooms.response';
import { ExamRoomSummaryData } from 'src/api/user/admin/exam-management/get-exam-rooms/get-exam-rooms.response';
import { ExamAttemptRepositoryService } from 'src/repositories/exam-attempt-repository/exam-attempt.repository';
import { ExamAnswerRepositoryService } from 'src/repositories/exam-answer-repository/exam-answer.repository';
import { EvaluationProgressData } from 'src/api/user/admin/exam-management/get-evaluation-progress/get-evaluation-progress.response';

const MIN_WRITTEN_MARKS = 2;
const MAX_WRITTEN_MARKS = 20;

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
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examQuestionRepositoryService: ExamQuestionRepositoryService,
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly examRoomAssignmentRepositoryService: ExamRoomAssignmentRepositoryService,
        private readonly examAttemptRepositoryService: ExamAttemptRepositoryService,
        private readonly examAnswerRepositoryService: ExamAnswerRepositoryService,
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

        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (data.mode === ExamMode.AUTO) {
            if (endDate.getTime() <= startDate.getTime()) {
                throw new BadRequestException('End Date must be after Start Date');
            }
            if (endDate.getTime() - startDate.getTime() < data.durationMinutes * 60000) {
                throw new BadRequestException('The Start-End window must be at least as long as the Duration');
            }
        } else {
            if (!data.startTime || !data.endTime) {
                throw new BadRequestException('Start Time and End Time are required for PROCTORING exams');
            }
            const startDateTime = this.combineDateTime(data.startDate, data.startTime);
            const endDateTime = this.combineDateTime(data.endDate, data.endTime);
            if (endDateTime.getTime() <= startDateTime.getTime()) {
                throw new BadRequestException('End Date+Time must be after Start Date+Time');
            }
            if (endDateTime.getTime() - startDateTime.getTime() < data.durationMinutes * 60000) {
                throw new BadRequestException('The Start-End window must be at least as long as the Duration');
            }
        }

        return { batch, course, department, section, subject };
    }

    private combineDateTime(date: string, time: string): Date {
        const datePart = new Date(date).toISOString().split('T')[0];
        return new Date(`${datePart}T${time}:00`);
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
            options: question.options,
            correctOptionIds: question.correctOptionIds,
            createdAt: question.createdAt,
        };
    }


    // Create Exam API Endpoint
    async createExamAPI(createExamData: CreateExamRequest, userId?: string) {
        this.validateMarks(createExamData.totalMarks, createExamData.passingMarks);
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
            startTime: createExamData.mode === ExamMode.PROCTORING ? createExamData.startTime : undefined,
            endTime: createExamData.mode === ExamMode.PROCTORING ? createExamData.endTime : undefined,
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
    // <=10 and round-robin assigns an active faculty as invigilator for each group
    async formExamRoomsAPI(examId: string): Promise<FormedRoomData[]> {
        const exam = await this.examRepositoryService.findById(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        if (exam.mode !== ExamMode.PROCTORING) {
            throw new BadRequestException('Rooms can only be formed for PROCTORING exams');
        }
        if (exam.status !== ExamStatus.PUBLISHED) {
            throw new BadRequestException('Exam must be PUBLISHED before forming rooms');
        }

        const existingRooms = await this.examRoomRepositoryService.findByExamId(examId);
        if (existingRooms.length > 0) {
            throw new ConflictException('Rooms have already been formed for this exam');
        }

        const studentIds = await this.getMatchedStudentIds(exam);
        if (studentIds.length === 0) {
            throw new BadRequestException('No students matched this exam\'s hierarchy selection');
        }

        const facultyIds = await this.facultyRepositoryService.findActiveFacultyIds();
        if (facultyIds.length === 0) {
            throw new BadRequestException('No active faculty available to assign as invigilators');
        }

        const startDateTime = this.combineDateTime(exam.startDate.toISOString(), exam.startTime as string);
        const endDateTime = this.combineDateTime(exam.endDate.toISOString(), exam.endTime as string);

        const groups: Types.ObjectId[][] = [];
        for (let i = 0; i < studentIds.length; i += this.MAX_STUDENTS_PER_ROOM) {
            groups.push(studentIds.slice(i, i + this.MAX_STUDENTS_PER_ROOM));
        }

        const examObjectId = new Types.ObjectId(examId);
        const roomsToCreate = groups.map((group, index) => ({
            examId: examObjectId,
            facultyId: facultyIds[index % facultyIds.length],
            startDateTime,
            endDateTime,
            durationMinutes: exam.durationMinutes,
            liveKitSessionId: `exam-room-${examId}-${index}`,
            status: ExamRoomStatus.SCHEDULED,
        }));

        const createdRooms = await this.examRoomRepositoryService.createMany(roomsToCreate as any);

        const assignmentsToCreate = createdRooms.flatMap((room, index) =>
            groups[index].map((studentId) => ({
                roomId: room._id as Types.ObjectId,
                examId: examObjectId,
                studentId,
                status: RoomAssignmentStatus.WAITING,
            })),
        );
        await this.examRoomAssignmentRepositoryService.createMany(assignmentsToCreate as any);

        const faculties = await this.facultyRepositoryService.findByIdsPreserveOrder(
            createdRooms.map((room) => room.facultyId),
        );
        const facultyCodeById = new Map(faculties.map((f) => [(f._id as Types.ObjectId).toString(), f.facultyId]));

        return createdRooms.map((room, index) => ({
            roomId: (room._id as Types.ObjectId).toString(),
            facultyId: room.facultyId.toString(),
            facultyCode: facultyCodeById.get(room.facultyId.toString()) || '',
            liveKitSessionId: room.liveKitSessionId,
            studentCount: groups[index].length,
        }));
    }


    // Get Exam Rooms API Endpoint — lists formed rooms with assignment status counts
    async getExamRoomsAPI(examId: string): Promise<ExamRoomSummaryData[]> {
        const exam = await this.examRepositoryService.findById(examId);
        if (!exam) throw new NotFoundException('Exam not found');

        const rooms = await this.examRoomRepositoryService.findByExamId(examId);
        const faculties = await this.facultyRepositoryService.findByIdsPreserveOrder(
            rooms.map((room) => room.facultyId),
        );
        const facultyCodeById = new Map(faculties.map((f) => [(f._id as Types.ObjectId).toString(), f.facultyId]));

        const summaries: ExamRoomSummaryData[] = [];
        for (const room of rooms) {
            const assignments = await this.examRoomAssignmentRepositoryService.findByRoomId(room._id as Types.ObjectId);
            const waitingCount = assignments.filter((a) => a.status === RoomAssignmentStatus.WAITING).length;
            const admittedCount = assignments.filter((a) => a.status === RoomAssignmentStatus.ADMITTED).length;
            const inProgressCount = assignments.filter((a) => a.status === RoomAssignmentStatus.IN_PROGRESS).length;
            const completedCount = assignments.filter((a) => a.status === RoomAssignmentStatus.COMPLETED).length;
            const removedOrRejectedCount = assignments.filter(
                (a) => a.status === RoomAssignmentStatus.REJECTED || a.status === RoomAssignmentStatus.REMOVED,
            ).length;

            summaries.push({
                roomId: (room._id as Types.ObjectId).toString(),
                facultyId: room.facultyId.toString(),
                facultyCode: facultyCodeById.get(room.facultyId.toString()) || '',
                liveKitSessionId: room.liveKitSessionId,
                startDateTime: room.startDateTime,
                endDateTime: room.endDateTime,
                status: room.status,
                waitingCount,
                admittedCount,
                inProgressCount,
                completedCount,
                removedOrRejectedCount,
                totalCount: assignments.length,
            });
        }

        return summaries;
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
        if (type === QuestionType.WRITTEN) {
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


    // Add Question API Endpoint
    async addQuestionAPI(examId: string, data: AddQuestionRequest, userId?: string): Promise<QuestionData> {
        const exam = await this.examRepositoryService.findById(examId);
        this.assertExamIsDraft(exam);

        if (data.type === QuestionType.WRITTEN) {
            if (data.marks < MIN_WRITTEN_MARKS || data.marks > MAX_WRITTEN_MARKS) {
                throw new BadRequestException(`Written questions must be worth between ${MIN_WRITTEN_MARKS} and ${MAX_WRITTEN_MARKS} marks`);
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
            options,
            correctOptionIds,
            createdBy: userId ? new Types.ObjectId(userId) : undefined,
        } as any);

        return this.mapQuestion(question);
    }


    // Edit Question API Endpoint
    async editQuestionAPI(examId: string, questionId: string, data: EditQuestionRequest, userId?: string): Promise<void> {
        const exam = await this.examRepositoryService.findById(examId);
        this.assertExamIsDraft(exam);

        const question = await this.examQuestionRepositoryService.findById(questionId);
        if (!question || question.examId.toString() !== examId) {
            throw new NotFoundException('Question not found');
        }

        const type = data.type ?? (question.type as QuestionType);
        const marks = data.marks ?? question.marks;

        if (type === QuestionType.WRITTEN && (marks < MIN_WRITTEN_MARKS || marks > MAX_WRITTEN_MARKS)) {
            throw new BadRequestException(`Written questions must be worth between ${MIN_WRITTEN_MARKS} and ${MAX_WRITTEN_MARKS} marks`);
        }

        const updatePayload: any = {
            type,
            text: data.text ?? question.text,
            marks,
            updatedBy: userId ? new Types.ObjectId(userId) : undefined,
        };

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
