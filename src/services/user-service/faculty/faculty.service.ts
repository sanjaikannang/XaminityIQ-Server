import { Types } from 'mongoose';
import { ChatRecipientType, ChatSenderRole, FacultyDesignation, RoomAssignmentStatus, SubmissionTrigger } from 'src/utils/enum';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';

// Requests
import { CreateSubjectRequest } from 'src/api/user/faculty/subject-management/create-subject/create-subject.request';
import { EditSubjectRequest } from 'src/api/user/faculty/subject-management/edit-subject/edit-subject.request';
import { GetAllSubjectsRequest } from 'src/api/user/faculty/subject-management/get-all-subjects/get-all-subjects.request';

// Response
import { PaginationMeta, SubjectData } from 'src/api/user/faculty/subject-management/get-all-subjects/get-all-subjects.response';

// Repositories
import { FacultyRepositoryService } from 'src/repositories/faculty-repository/faculty.repository';
import { FacultyEmploymentDetailRepositoryService } from 'src/repositories/faculty-employment-detail-repository/faculty-employment-detail.repository';
import { DepartmentRepositoryService } from 'src/repositories/department-repository/department.repository';
import { CourseRepositoryService } from 'src/repositories/course-repository/course.repository';
import { SubjectRepositoryService } from 'src/repositories/subject-repository/subject.repository';
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamRoomRepositoryService } from 'src/repositories/exam-room-repository/exam-room.repository';
import { ExamRoomAssignmentRepositoryService } from 'src/repositories/exam-room-assignment-repository/exam-room-assignment.repository';
import { ExamRoomChatMessageRepositoryService } from 'src/repositories/exam-room-chat-message-repository/exam-room-chat-message.repository';

// Services
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { LiveKitService } from 'src/livekit/livekit.service';
import { ConfigService } from 'src/config/config.service';

const SUBJECT_LIMIT_PER_SEMESTER = 6;

@Injectable()
export class FacultyService {
    constructor(
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly facultyEmploymentDetailRepositoryService: FacultyEmploymentDetailRepositoryService,
        private readonly departmentRepositoryService: DepartmentRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly subjectRepositoryService: SubjectRepositoryService,
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly examRoomAssignmentRepositoryService: ExamRoomAssignmentRepositoryService,
        private readonly examRoomChatMessageRepositoryService: ExamRoomChatMessageRepositoryService,
        private readonly examAttemptService: ExamAttemptService,
        private readonly liveKitService: LiveKitService,
        private readonly configService: ConfigService,
    ) { }


    // Resolve the authenticated user's Faculty document — no HOD/designation
    // check, since proctoring is available to any assigned faculty
    private async resolveFaculty(userId: string): Promise<Types.ObjectId> {
        const faculty = await this.facultyRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!faculty) {
            throw new NotFoundException('Faculty profile not found');
        }
        return faculty._id as Types.ObjectId;
    }


    // Ownership-check helper — confirms the room belongs to this faculty
    private async ownRoomOrThrow(facultyId: Types.ObjectId, roomId: string) {
        const room = await this.examRoomRepositoryService.findById(roomId);
        if (!room || room.facultyId.toString() !== facultyId.toString()) {
            throw new NotFoundException('Room not found');
        }
        return room;
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


    // Get My Exam Rooms API Endpoint — rooms this faculty invigilates
    async getMyExamRoomsAPI(userId: string) {
        const facultyId = await this.resolveFaculty(userId);
        const rooms = await this.examRoomRepositoryService.findByFacultyId(facultyId);

        const results: any[] = [];
        for (const room of rooms) {
            const exam = await this.examRepositoryService.findByIdRaw(room.examId.toString());
            const assignments = await this.examRoomAssignmentRepositoryService.findByRoomId(room._id as Types.ObjectId);
            results.push({
                roomId: (room._id as Types.ObjectId).toString(),
                examId: room.examId.toString(),
                examName: exam?.name || '',
                startDateTime: room.startDateTime,
                endDateTime: room.endDateTime,
                status: room.status,
                studentCount: assignments.length,
            });
        }
        return results;
    }


    // Get LiveKit Token API Endpoint (faculty) — full grants, since the invigilator
    // both views every admitted student's tracks and may publish their own camera/mic
    async getLiveKitTokenAPI(userId: string, roomId: string) {
        const facultyId = await this.resolveFaculty(userId);
        const room = await this.ownRoomOrThrow(facultyId, roomId);

        const identity = `faculty-${facultyId.toString()}`;
        const token = await this.liveKitService.generateToken(
            room.liveKitSessionId,
            identity,
            identity,
            { canPublish: true, canSubscribe: true, canPublishData: true },
        );

        return {
            token,
            liveKitUrl: this.configService.getLiveKitUrl(),
            roomName: room.liveKitSessionId,
            identity,
        };
    }


    // Get Exam Room Detail API Endpoint (ownership-checked) — full waiting queue + admitted list
    async getExamRoomDetailAPI(userId: string, roomId: string) {
        const facultyId = await this.resolveFaculty(userId);
        const room = await this.ownRoomOrThrow(facultyId, roomId);

        const exam = await this.examRepositoryService.findByIdRaw(room.examId.toString());
        const assignments = await this.examRoomAssignmentRepositoryService.findByRoomId(roomId);
        const students = await this.studentRepositoryService.findByIdsPreserveOrder(assignments.map((a) => a.studentId));
        const studentCodeById = new Map(students.map((s) => [(s._id as Types.ObjectId).toString(), s.studentId]));

        return {
            roomId,
            examId: room.examId.toString(),
            examName: exam?.name || '',
            startDateTime: room.startDateTime,
            endDateTime: room.endDateTime,
            status: room.status,
            liveKitSessionId: room.liveKitSessionId,
            assignments: assignments.map((a) => ({
                assignmentId: (a._id as Types.ObjectId).toString(),
                studentId: a.studentId.toString(),
                studentCode: studentCodeById.get(a.studentId.toString()) || '',
                attemptId: a.attemptId ? a.attemptId.toString() : null,
                status: a.status,
                enteredWaitingRoomAt: a.enteredWaitingRoomAt,
                admittedAt: a.admittedAt,
                removedAt: a.removedAt,
                removalReason: a.removalReason,
            })),
        };
    }


    // Admit Student API Endpoint — creates the attempt at admission time and connects it to this room
    async admitStudentAPI(userId: string, roomId: string, assignmentId: string) {
        const facultyId = await this.resolveFaculty(userId);
        await this.ownRoomOrThrow(facultyId, roomId);

        const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndId(roomId, assignmentId);
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }
        if (assignment.status !== RoomAssignmentStatus.WAITING) {
            throw new ConflictException('Only a WAITING student can be admitted');
        }

        const attempt = await this.examAttemptService.createAttemptOnAdmission(
            assignment.examId.toString(),
            assignment.studentId.toString(),
            assignment.roomId as Types.ObjectId,
        );

        await this.examRoomAssignmentRepositoryService.updateById(assignmentId, {
            status: RoomAssignmentStatus.ADMITTED,
            attemptId: attempt._id as Types.ObjectId,
            admittedAt: new Date(),
            admittedBy: facultyId,
        });

        return { message: 'Student admitted', attemptId: (attempt._id as Types.ObjectId).toString() };
    }


    // Reject Student API Endpoint — turns away a waiting student before admission
    async rejectStudentAPI(userId: string, roomId: string, assignmentId: string, reason: string) {
        const facultyId = await this.resolveFaculty(userId);
        await this.ownRoomOrThrow(facultyId, roomId);

        const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndId(roomId, assignmentId);
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }
        if (assignment.status !== RoomAssignmentStatus.WAITING) {
            throw new ConflictException('Only a WAITING student can be rejected');
        }

        await this.examRoomAssignmentRepositoryService.updateById(assignmentId, {
            status: RoomAssignmentStatus.REJECTED,
            removedAt: new Date(),
            removedBy: facultyId,
            removalReason: reason,
        });

        return { message: 'Student rejected' };
    }


    // Remove Student API Endpoint — forces disconnection of an admitted student and
    // finalizes their attempt through the same path as a manual submit
    async removeStudentAPI(userId: string, roomId: string, assignmentId: string, reason?: string) {
        const facultyId = await this.resolveFaculty(userId);
        const room = await this.ownRoomOrThrow(facultyId, roomId);

        const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndId(roomId, assignmentId);
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }
        if (!assignment.attemptId) {
            throw new ConflictException('This student has not been admitted yet');
        }

        await this.examAttemptService.finalizeAttemptByFaculty(assignment.attemptId.toString(), SubmissionTrigger.FACULTY_REMOVED);

        await this.examRoomAssignmentRepositoryService.updateById(assignmentId, {
            status: RoomAssignmentStatus.REMOVED,
            removedAt: new Date(),
            removedBy: facultyId,
            removalReason: reason,
        });

        try {
            await this.liveKitService.removeParticipant(room.liveKitSessionId, `student-${assignment.studentId.toString()}`);
        } catch {
            // Best-effort — the student may already be disconnected or LiveKit may not be configured yet
        }

        return { message: 'Student removed' };
    }


    // Send Chat API Endpoint (faculty) — can target one student (INDIVIDUAL) or the whole room (BROADCAST_ROOM)
    async sendChatAPI(
        userId: string,
        roomId: string,
        message: string,
        recipientType: ChatRecipientType,
        recipientStudentId?: string,
    ) {
        const facultyId = await this.resolveFaculty(userId);
        await this.ownRoomOrThrow(facultyId, roomId);

        if (recipientType === ChatRecipientType.INDIVIDUAL) {
            if (!recipientStudentId) {
                throw new BadRequestException('recipientStudentId is required for an INDIVIDUAL message');
            }
            const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndStudent(roomId, recipientStudentId);
            if (!assignment) {
                throw new NotFoundException('Student is not assigned to this room');
            }
        } else if (recipientType !== ChatRecipientType.BROADCAST_ROOM) {
            throw new BadRequestException('Faculty can only send INDIVIDUAL or BROADCAST_ROOM messages');
        }

        const chatMessage = await this.examRoomChatMessageRepositoryService.create({
            roomId: new Types.ObjectId(roomId),
            senderRole: ChatSenderRole.FACULTY,
            senderId: new Types.ObjectId(userId),
            recipientType,
            recipientStudentId: recipientStudentId ? new Types.ObjectId(recipientStudentId) : undefined,
            message,
            sentAt: new Date(),
        } as any);

        return this.mapChatMessage(chatMessage);
    }


    // Get Chat History API Endpoint (faculty) — sees every message in the room, no filtering needed
    async getChatHistoryAPI(userId: string, roomId: string) {
        const facultyId = await this.resolveFaculty(userId);
        await this.ownRoomOrThrow(facultyId, roomId);

        const messages = await this.examRoomChatMessageRepositoryService.findByRoomId(roomId);
        return messages.map((m) => this.mapChatMessage(m));
    }


    // Resolve the authenticated user's Faculty document and confirm they are an HOD,
    // returning the department they head. Every subject-management method below
    // relies on this instead of trusting any department id from the client.
    private async resolveHod(userId: string): Promise<{ facultyId: Types.ObjectId; departmentId: Types.ObjectId }> {
        const faculty = await this.facultyRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!faculty) {
            throw new NotFoundException('Faculty profile not found');
        }

        const employmentDetail = await this.facultyEmploymentDetailRepositoryService.findById(faculty.employmentDetailId);
        if (!employmentDetail) {
            throw new NotFoundException('Faculty employment details not found');
        }

        if (employmentDetail.designation !== FacultyDesignation.HOD) {
            throw new ForbiddenException('Only the Head of Department can manage subjects');
        }

        return {
            facultyId: faculty._id as Types.ObjectId,
            departmentId: employmentDetail.departmentId,
        };
    }


    // Validate that a semester falls within the department's course's total semester count
    private async validateSemesterBound(departmentId: Types.ObjectId, semester: number): Promise<void> {
        const department = await this.departmentRepositoryService.findById(departmentId.toString());
        if (!department) {
            throw new NotFoundException('Department not found');
        }

        const course = await this.courseRepositoryService.findById(department.courseId.toString());
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        if (semester < 1 || semester > course.semesters) {
            throw new BadRequestException(`Semester must be between 1 and ${course.semesters} for this department's course`);
        }
    }


    private mapSubject(subject: any): SubjectData {
        return {
            _id: subject._id.toString(),
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            semester: subject.semester,
            credits: subject.credits,
            subjectType: subject.subjectType,
            description: subject.description,
            createdAt: subject.createdAt,
        };
    }


    // Create Subject API Endpoint
    async createSubjectAPI(userId: string, data: CreateSubjectRequest) {
        const { departmentId, facultyId } = await this.resolveHod(userId);

        await this.validateSemesterBound(departmentId, data.semester);

        const existingCount = await this.subjectRepositoryService.countByDepartmentAndSemester(departmentId, data.semester);
        if (existingCount >= SUBJECT_LIMIT_PER_SEMESTER) {
            throw new ConflictException(`This semester already has the maximum of ${SUBJECT_LIMIT_PER_SEMESTER} subjects`);
        }

        const existingCode = await this.subjectRepositoryService.findByCode(data.subjectCode);
        if (existingCode) {
            throw new ConflictException('Subject code already in use');
        }

        return this.subjectRepositoryService.create({
            departmentId,
            semester: data.semester,
            subjectCode: data.subjectCode,
            subjectName: data.subjectName,
            credits: data.credits,
            subjectType: data.subjectType,
            description: data.description,
            createdBy: facultyId,
        });
    }


    // Get My (HOD's own department) Subjects API Endpoint
    async getMySubjectsAPI(
        userId: string,
        query: GetAllSubjectsRequest,
    ): Promise<{ subjects: SubjectData[]; pagination: PaginationMeta }> {
        const { departmentId } = await this.resolveHod(userId);

        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const filters = { semester: query.semester };

        const totalItems = await this.subjectRepositoryService.countByDepartment(departmentId, filters);
        const subjects = await this.subjectRepositoryService.findByDepartment(
            departmentId,
            filters,
            skip,
            limit,
            query.sortBy,
            query.sortOrder || 'asc',
        );

        const totalPages = Math.ceil(totalItems / limit);

        return {
            subjects: subjects.map((s) => this.mapSubject(s)),
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


    // Get Subject By Id API Endpoint (ownership-checked)
    async getSubjectByIdAPI(userId: string, subjectId: string): Promise<SubjectData> {
        const { departmentId } = await this.resolveHod(userId);

        const subject = await this.subjectRepositoryService.findById(subjectId);
        if (!subject || !subject.isActive || subject.departmentId.toString() !== departmentId.toString()) {
            throw new NotFoundException('Subject not found');
        }

        return this.mapSubject(subject);
    }


    // Edit Subject API Endpoint (ownership-checked)
    async editSubjectAPI(userId: string, subjectId: string, data: EditSubjectRequest): Promise<void> {
        const { departmentId } = await this.resolveHod(userId);

        const subject = await this.subjectRepositoryService.findById(subjectId);
        if (!subject || !subject.isActive || subject.departmentId.toString() !== departmentId.toString()) {
            throw new NotFoundException('Subject not found');
        }

        if (data.semester !== undefined) {
            await this.validateSemesterBound(departmentId, data.semester);

            if (data.semester !== subject.semester) {
                const existingCount = await this.subjectRepositoryService.countByDepartmentAndSemester(
                    departmentId,
                    data.semester,
                );
                if (existingCount >= SUBJECT_LIMIT_PER_SEMESTER) {
                    throw new ConflictException(`This semester already has the maximum of ${SUBJECT_LIMIT_PER_SEMESTER} subjects`);
                }
            }
        }

        if (data.subjectCode !== undefined && data.subjectCode !== subject.subjectCode) {
            const existingCode = await this.subjectRepositoryService.findByCode(data.subjectCode);
            if (existingCode) {
                throw new ConflictException('Subject code already in use');
            }
        }

        await this.subjectRepositoryService.updateById(subjectId, data);
    }


    // Delete Subject API Endpoint (ownership-checked, soft delete)
    async deleteSubjectAPI(userId: string, subjectId: string): Promise<void> {
        const { departmentId } = await this.resolveHod(userId);

        const subject = await this.subjectRepositoryService.findById(subjectId);
        if (!subject || !subject.isActive || subject.departmentId.toString() !== departmentId.toString()) {
            throw new NotFoundException('Subject not found');
        }

        await this.subjectRepositoryService.softDeleteById(subjectId);
    }

}
