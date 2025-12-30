import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { Types } from "mongoose";
import { ExamMode } from "src/utils/enum";
import { Hms100msService } from "src/100ms/100ms.service";

// Requests
import { CreateExamRequest } from "src/api/user/admin/exam-management/create-exam/create-exam.request";

// Response

// Repositories
import { ExamRepositoryService } from "src/repositories/exam-repository/exam.repository";
import { ExamRoomRepositoryService } from "src/repositories/exam-room-repository/exam-room.repository";
import { FacultyAssignmentRepositoryService } from "src/repositories/faculty-assignment-repository/faculty-assignment.repository";
import { FacultyRepositoryService } from "src/repositories/faculty-repository/faculty.repository";
import { StudentEnrollmentRepositoryService } from "src/repositories/student-enrollment-repository/student-enrollment.repository";
import { StudentRepositoryService } from "src/repositories/student-repository/student.repository";
import { StudentEnrollment } from "src/schemas/Exam/studentEnrollments.schema";


@Injectable()
export class ExamManagementService {
    constructor(
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly studentEnrollmentRepositoryService: StudentEnrollmentRepositoryService,
        private readonly facultyAssignmentRepositoryService: FacultyAssignmentRepositoryService,
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly hms100msService: Hms100msService,
    ) { }


    // Cretae Exam API Endpoint
    async createExamAPI(createExamData: CreateExamRequest) {
        try {
            console.log("createExamData", createExamData)
            // 1. Validate students exist
            // await this.validateStudents(createExamData.studentIds);

            // 2. Validate faculty if mode is PROCTORING
            if (createExamData.mode === ExamMode.PROCTORING) {
                if (!createExamData.facultyIds || createExamData.facultyIds.length === 0) {
                    throw new BadRequestException('Faculty is required for PROCTORING mode');
                }
                // await this.validateFaculty(createExamData.facultyIds);
            }

            // 3. Create the exam
            const exam = await this.examRepositoryService.create({
                examName: createExamData.examName,
                examDate: new Date(createExamData.examDate),
                startTime: createExamData.startTime,
                endTime: createExamData.endTime,
                duration: createExamData.duration,
                mode: createExamData.mode,
                createdBy: new Types.ObjectId(), // Get from JWT context
            });
            console.log("exam...", exam);

            // 4. Distribute students into rooms (max 20 per room)
            const studentBatches = this.chunkArray(
                createExamData.studentIds,
                createExamData.maxStudentsPerRoom
            );
            console.log("studentBatches", studentBatches);

            // 5. Create rooms and enroll students
            for (let i = 0; i < studentBatches.length; i++) {
                const batch = studentBatches[i];

                // Create 100ms room
                const roomName = `${createExamData.examName}-${exam._id}-Room${i + 1}`;
                const hmsRoom = await this.hms100msService.createRoom(roomName);
                console.log("hmsRoom", hmsRoom);

                // Create ExamRoom
                const examRoom = await this.examRoomRepositoryService.create({
                    examId: exam._id,
                    hmsRoomId: hmsRoom.id,
                    hmsRoomName: hmsRoom.name,
                    maxStudents: createExamData.maxStudentsPerRoom,
                    currentStudents: batch.length,
                });
                console.log("examRoom", examRoom);

                // Force TypeScript to treat examRoom._id as ObjectId
                const examRoomId = new Types.ObjectId(examRoom._id);

                // Enroll students in this room
                const enrollments = batch.map(studentId => ({
                    examId: new Types.ObjectId(exam._id),
                    studentId: new Types.ObjectId(studentId),
                    examRoomId,
                }));
                await this.studentEnrollmentRepositoryService.createMany(
                    enrollments as Omit<StudentEnrollment, '_id'>[]
                );

                // Assign faculty if PROCTORING mode
                if (createExamData.mode === ExamMode.PROCTORING && createExamData.facultyIds) {
                    const facultyId = createExamData.facultyIds[i % createExamData.facultyIds.length];
                    await this.facultyAssignmentRepositoryService.create({
                        examId: new Types.ObjectId(exam._id),
                        facultyId: new Types.ObjectId(facultyId),
                        examRoomId,
                    });
                }
            }

            return exam;

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to create exam'
            );
        }
    }

    // Validate students exist
    private async validateStudents(studentIds: string[]) {
        const students = await this.studentRepositoryService.findByIds(
            studentIds.map(id => new Types.ObjectId(id))
        );

        if (students.length !== studentIds.length) {
            throw new NotFoundException('One or more students not found');
        }
    }

    // Validate faculty exist
    private async validateFaculty(facultyIds: string[]) {
        const faculty = await this.facultyRepositoryService.findByIds(
            facultyIds.map(id => new Types.ObjectId(id))
        );

        if (faculty.length !== facultyIds.length) {
            throw new NotFoundException('One or more faculty not found');
        }
    }

    // Helper: Split array into chunks
    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}