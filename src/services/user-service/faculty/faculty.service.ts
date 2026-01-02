import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { Types } from "mongoose";

// Response
import { FacultyExam } from "src/api/user/faculty/get-exams/get-exams.response";

// Requests

// Repositories
import { ExamRepositoryService } from "src/repositories/exam-repository/exam.repository";
import { ExamRoomRepositoryService } from "src/repositories/exam-room-repository/exam-room.repository";
import { FacultyAssignmentRepositoryService } from "src/repositories/faculty-assignment-repository/faculty-assignment.repository";
import { StudentEnrollmentRepositoryService } from "src/repositories/student-enrollment-repository/student-enrollment.repository";

@Injectable()
export class FacultyService {
    constructor(
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly studentEnrollmentRepositoryService: StudentEnrollmentRepositoryService,
        private readonly facultyAssignmentRepositoryService: FacultyAssignmentRepositoryService
    ) { }


    // Get Exams API Endpoint
    async getExams(facultyId: string) {
        try {

            const facultyObjectId = new Types.ObjectId(facultyId);
            console.log("facultyObjectId...", facultyObjectId);

            // Get all assignments for this faculty
            const assignments = await this.facultyAssignmentRepositoryService
                .findByFacultyId(facultyObjectId);
                
                console.log("assignments...", assignments);

            if (!assignments || assignments.length === 0) {
                return [];
            }

            // Get exam IDs from assignments
            const examIds = assignments.map(assignment => assignment.examId);
            console.log("examIds", examIds)

            // Fetch all exams
            const exams = await this.examRepositoryService.findByIds(examIds);
            console.log("exams", exams);

            // Build response
            const facultyExams: FacultyExam[] = [];
            console.log("facultyExams...", facultyExams)

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

}