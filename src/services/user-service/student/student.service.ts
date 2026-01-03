import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { Types } from "mongoose";
import { EnrollmentStatus, ExamStatus } from "src/utils/enum";

// Service 
import { Hms100msService } from "src/100ms/100ms.service";

// Response
import { StudentExam } from "src/api/user/student/get-exams/get-exams.response";

// Requests

// Repositories
import { ExamRepositoryService } from "src/repositories/exam-repository/exam.repository";
import { ExamRoomRepositoryService } from "src/repositories/exam-room-repository/exam-room.repository";
import { StudentEnrollmentRepositoryService } from "src/repositories/student-enrollment-repository/student-enrollment.repository";


@Injectable()
export class StudentService {
    constructor(
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly studentEnrollmentRepositoryService: StudentEnrollmentRepositoryService,
        private readonly hms100msService: Hms100msService
    ) { }


    // Get Exams API Endpoint
    async getExams(studentId: string) {
        try {
            const studentObjectId = new Types.ObjectId(studentId);

            // Get all enrollments for this student
            const enrollments = await this.studentEnrollmentRepositoryService
                .findByStudentId(studentObjectId);

            if (!enrollments || enrollments.length === 0) {
                return [];
            }

            // Get exam IDs from enrollments
            const examIds = enrollments.map(enrollment => enrollment.examId);

            // Fetch all exams
            const exams = await this.examRepositoryService.findByIds(examIds);

            // Build response
            const studentExams: StudentExam[] = [];

            for (const exam of exams) {
                // Find enrollment for this exam
                const enrollment = enrollments.find(
                    e => e.examId.toString() === exam._id.toString()
                );

                if (!enrollment) continue;

                // Get exam room info
                const examRoom = await this.examRoomRepositoryService
                    .findByExamId(exam._id);

                // Determine if student can join
                const canJoin = !!(
                    examRoom &&
                    exam.status === ExamStatus.ONGOING
                );

                studentExams.push({
                    examId: exam._id.toString(),
                    examName: exam.examName,
                    examDate: exam.examDate,
                    startTime: exam.startTime,
                    endTime: exam.endTime,
                    duration: exam.duration,
                    mode: exam.mode,
                    status: exam.status,
                    enrollmentStatus: enrollment.status,
                    canJoin,
                });
            }

            // Sort by exam date (ascending)
            studentExams.sort((a, b) =>
                new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
            );

            return studentExams;

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error getting exams');
        }
    }


    // Join Exam API Endpoint
    async joinExam(examId: string, studentId: string) {
        try {
            const examObjectId = new Types.ObjectId(examId);
            const studentObjectId = new Types.ObjectId(studentId);

            // 1. Verify exam exists
            const exam = await this.examRepositoryService.findById(examObjectId);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            // 2. Verify student is enrolled in this exam
            const enrollment = await this.studentEnrollmentRepositoryService
                .findByExamIdAndStudentId(examObjectId, studentObjectId);

            if (!enrollment) {
                throw new BadRequestException('You are not enrolled in this exam');
            }

            // 3. Check enrollment status
            if (enrollment.status !== EnrollmentStatus.ENROLLED) {
                throw new BadRequestException(
                    `Cannot join exam. Enrollment status: ${enrollment.status}`
                );
            }

            // 4. Check if exam room exists
            const examRoom = await this.examRoomRepositoryService
                .findByExamId(examObjectId);

            if (!examRoom || !examRoom.hmsRoomId) {
                throw new BadRequestException('Exam room has not been created yet');
            }

            // 5. Verify exam is ongoing
            // if (exam.status !== ExamStatus.ONGOING) {
            //     throw new BadRequestException(
            //         `Cannot join exam. Exam status: ${exam.status}`
            //     );
            // }

            // 6. Check if exam has already been completed by student
            // if (enrollment.status === EnrollmentStatus.COMPLETED) {
            //     throw new BadRequestException('You have already completed this exam');
            // }

            // 7. Generate 100ms auth token for student
            const authTokenResponse = await this.hms100msService.generateAuthToken(
                examRoom.hmsRoomId,
                studentId,
                'student'
            );

            // 8. Optional: Update enrollment status to 'in-progress' or track join time
            // await this.studentEnrollmentRepositoryService.updateStatus(
            //     enrollment._id,
            //     EnrollmentStatus.IN_PROGRESS
            // );

            // 9. Return join data
            return {
                roomId: examRoom.hmsRoomId,
                authToken: authTokenResponse.token,
                examName: exam.examName,
                duration: exam.duration,
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