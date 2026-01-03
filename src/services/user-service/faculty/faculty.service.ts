import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { Types } from "mongoose";

// Service
import { Hms100msService } from "src/100ms/100ms.service";

// Response
import { FacultyExam } from "src/api/user/faculty/get-exams/get-exams.response";

// Requests

// Repositories
import { ExamRepositoryService } from "src/repositories/exam-repository/exam.repository";
import { ExamRoomRepositoryService } from "src/repositories/exam-room-repository/exam-room.repository";
import { FacultyAssignmentRepositoryService } from "src/repositories/faculty-assignment-repository/faculty-assignment.repository";
import { StudentEnrollmentRepositoryService } from "src/repositories/student-enrollment-repository/student-enrollment.repository";
import { ExamStatus } from "src/utils/enum";

@Injectable()
export class FacultyService {
    constructor(
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly studentEnrollmentRepositoryService: StudentEnrollmentRepositoryService,
        private readonly facultyAssignmentRepositoryService: FacultyAssignmentRepositoryService,
        private readonly hms100msService: Hms100msService
    ) { }


    // Get Exams API Endpoint
    async getExams(facultyId: string) {
        try {

            const facultyObjectId = new Types.ObjectId(facultyId);

            // Get all assignments for this faculty
            const assignments = await this.facultyAssignmentRepositoryService
                .findByFacultyId(facultyObjectId);

            if (!assignments || assignments.length === 0) {
                return [];
            }

            // Get exam IDs from assignments
            const examIds = assignments.map(assignment => assignment.examId);

            // Fetch all exams
            const exams = await this.examRepositoryService.findByIds(examIds);

            // Build response
            const facultyExams: FacultyExam[] = [];

            for (const exam of exams) {
                // Find assignment for this exam
                const assignment = assignments.find(
                    a => a.examId.toString() === exam._id.toString()
                );

                if (!assignment) continue;

                // Get exam room info
                const examRoom = await this.examRoomRepositoryService
                    .findByExamId(exam._id);

                // Count enrolled students
                const enrolledStudents = await this.studentEnrollmentRepositoryService
                    .countByExamId(exam._id);

                facultyExams.push({
                    examId: exam._id.toString(),
                    examName: exam.examName,
                    examDate: exam.examDate,
                    startTime: exam.startTime,
                    endTime: exam.endTime,
                    duration: exam.duration,
                    mode: exam.mode,
                    status: exam.status,
                    totalStudents: enrolledStudents,
                    roomCreated: !!examRoom,
                    hmsRoomId: examRoom?.hmsRoomId,
                });
            }

            // Sort by exam date (ascending)
            facultyExams.sort((a, b) =>
                new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
            );

            return facultyExams;

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error getting exams');
        }
    }


    // Join Exam API Endpoint
    async joinExam(examId: string, facultyId: string) {
        try {
            const examObjectId = new Types.ObjectId(examId);
            const facultyObjectId = new Types.ObjectId(facultyId);

            // 1. Verify exam exists
            const exam = await this.examRepositoryService.findById(examObjectId);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            // 2. Verify faculty is assigned to this exam
            const assignment = await this.facultyAssignmentRepositoryService
                .findByExamIdAndFacultyId(examObjectId, facultyObjectId);

            if (!assignment) {
                throw new BadRequestException('You are not assigned to monitor this exam');
            }

            // 3. Check if exam room exists
            const examRoom = await this.examRoomRepositoryService
                .findByExamId(examObjectId);

            if (!examRoom || !examRoom.hmsRoomId) {
                throw new BadRequestException('Exam room has not been created yet');
            }

            // 4. Verify exam status (should be ONGOING or allow faculty to join early)
            if (exam.status === ExamStatus.COMPLETED) {
                throw new BadRequestException('This exam has already been completed');
            }

            // 5. Generate 100ms auth token for faculty (proctor role)
            const authTokenResponse = await this.hms100msService.generateAuthToken(
                examRoom.hmsRoomId,
                facultyId,
                'proctor'
            );

            // 6. Count enrolled students
            const totalStudents = await this.studentEnrollmentRepositoryService
                .countByExamId(examObjectId);

            // 7. Return join data
            return {
                roomId: examRoom.hmsRoomId,
                authToken: authTokenResponse.token,
                examName: exam.examName,
                totalStudents: totalStudents,
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            console.error('Error joining exam:', error);
            throw new InternalServerErrorException('Failed to join exam room');
        }
    }

}