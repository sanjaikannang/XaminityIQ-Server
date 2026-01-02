import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { Types } from "mongoose";
import { ExamStatus } from "src/utils/enum";

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

}