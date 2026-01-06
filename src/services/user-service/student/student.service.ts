import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { Types } from "mongoose";
import { EnrollmentStatus, ExamStatus, JoinRequestStatus } from "src/utils/enum";

// Service 
import { Hms100msService } from "src/100ms/100ms.service";

// Response
import { StudentExam } from "src/api/user/student/get-exams/get-exams.response";

// Requests

// Repositories
import { ExamRepositoryService } from "src/repositories/exam-repository/exam.repository";
import { ExamRoomRepositoryService } from "src/repositories/exam-room-repository/exam-room.repository";
import { StudentEnrollmentRepositoryService } from "src/repositories/student-enrollment-repository/student-enrollment.repository";
import { FacultyAssignmentRepositoryService } from "src/repositories/faculty-assignment-repository/faculty-assignment.repository";
import { FacultyRepositoryService } from "src/repositories/faculty-repository/faculty.repository";
import { StudentJoinRequestRepositoryService } from "src/repositories/student-join-request-repository/student-join-request-repository";


@Injectable()
export class StudentService {
    constructor(
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly studentEnrollmentRepositoryService: StudentEnrollmentRepositoryService,
        private readonly hms100msService: Hms100msService,
        private readonly facultyAssignmentRepositoryService: FacultyAssignmentRepositoryService,
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly studentJoinRequestRepositoryService: StudentJoinRequestRepositoryService,
    ) { }


    // Get Exams API Endpoint
    async getExams(studentId: string) {
        try {
            const studentObjectId = new Types.ObjectId(studentId);
            const enrollments = await this.studentEnrollmentRepositoryService
                .findByStudentId(studentObjectId);

            if (!enrollments || enrollments.length === 0) {
                return [];
            }

            const examIds = enrollments.map(enrollment => enrollment.examId);
            const exams = await this.examRepositoryService.findByIds(examIds);
            const studentExams: StudentExam[] = [];

            for (const exam of exams) {
                const enrollment = enrollments.find(
                    e => e.examId.toString() === exam._id.toString()
                );

                if (!enrollment) continue;

                const examRoom = await this.examRoomRepositoryService
                    .findByExamId(exam._id);

                // Check if within exam time window
                const now = new Date();
                const examDate = new Date(exam.examDate);
                const [startHour, startMin] = exam.startTime.split(':').map(Number);
                const [endHour, endMin] = exam.endTime.split(':').map(Number);

                examDate.setHours(startHour, startMin, 0, 0);
                const examEndDate = new Date(exam.examDate);
                examEndDate.setHours(endHour, endMin, 0, 0);

                const isWithinExamTime = now >= examDate && now <= examEndDate;
                const canJoin = !!(
                    examRoom &&
                    exam.status === ExamStatus.ONGOING &&
                    isWithinExamTime
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

    // Get Exam Details for Environment Check
    async getExamDetails(examId: string, studentId: string) {
        try {
            const examObjectId = new Types.ObjectId(examId);
            const studentObjectId = new Types.ObjectId(studentId);

            const exam = await this.examRepositoryService.findById(examObjectId);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            const enrollment = await this.studentEnrollmentRepositoryService
                .findByExamIdAndStudentId(examObjectId, studentObjectId);

            if (!enrollment) {
                throw new BadRequestException('You are not enrolled in this exam');
            }

            if (enrollment.status !== EnrollmentStatus.ENROLLED) {
                throw new BadRequestException(
                    `Cannot access exam. Enrollment status: ${enrollment.status}`
                );
            }

            const examRoom = await this.examRoomRepositoryService
                .findByExamId(examObjectId);

            if (!examRoom || !examRoom.hmsRoomId) {
                throw new BadRequestException('Exam room has not been created yet');
            }

            // Get faculty details
            const facultyAssignment = await this.facultyAssignmentRepositoryService
                .findByExamRoomId(examRoom._id as Types.ObjectId);

            if (!facultyAssignment) {
                throw new NotFoundException('Faculty not assigned to this exam');
            }

            // const faculty = await this.facultyRepositoryService
            //     .findById(facultyAssignment.facultyId);

            // if (!faculty) {
            //     throw new NotFoundException('Faculty details not found');
            // }

            return {
                examName: exam.examName,
                examDate: exam.examDate,
                startTime: exam.startTime,
                endTime: exam.endTime,
                duration: exam.duration,
                mode: exam.mode,
                instructions: [
                    "Camera must remain turned on throughout the exam",
                    "Microphone will be monitored by the proctor",
                    "No additional tabs or windows should be opened",
                    "Maintain proper lighting and clear visibility",
                    "Any suspicious activity will be flagged",
                    "Contact the proctor if you face any technical issues"
                ],
                // faculty: {
                //     name: faculty.name,
                //     email: faculty.email,
                //     phone: faculty.phone
                // }
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            console.error('Error getting exam details:', error);
            throw new InternalServerErrorException('Failed to get exam details');
        }
    }

    // Request to Join Exam
    async requestJoinExam(examId: string, studentId: string) {
        try {
            const examObjectId = new Types.ObjectId(examId);
            const studentObjectId = new Types.ObjectId(studentId);

            // 1. Verify exam exists and is ongoing
            const exam = await this.examRepositoryService.findById(examObjectId);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            // if (exam.status !== ExamStatus.ONGOING) {
            //     throw new BadRequestException('Exam is not currently ongoing');
            // }

            // 2. Check if within exam time window
            const now = new Date();
            const examDate = new Date(exam.examDate);
            const [startHour, startMin] = exam.startTime.split(':').map(Number);
            const [endHour, endMin] = exam.endTime.split(':').map(Number);

            examDate.setHours(startHour, startMin, 0, 0);
            const examEndDate = new Date(exam.examDate);
            examEndDate.setHours(endHour, endMin, 0, 0);

            if (now < examDate || now > examEndDate) {
                throw new BadRequestException('Cannot join exam outside scheduled time');
            }

            // 3. Verify student enrollment
            const enrollment = await this.studentEnrollmentRepositoryService
                .findByExamIdAndStudentId(examObjectId, studentObjectId);

            if (!enrollment) {
                throw new BadRequestException('You are not enrolled in this exam');
            }

            if (enrollment.status !== EnrollmentStatus.ENROLLED) {
                throw new BadRequestException(
                    `Cannot join exam. Enrollment status: ${enrollment.status}`
                );
            }

            // 4. Get exam room
            const examRoom = await this.examRoomRepositoryService
                .findByExamId(examObjectId);

            if (!examRoom || !examRoom.hmsRoomId) {
                throw new BadRequestException('Exam room has not been created yet');
            }

            // 5. Get faculty assignment
            const facultyAssignment = await this.facultyAssignmentRepositoryService
                .findByExamRoomId(examRoom._id as Types.ObjectId);

            if (!facultyAssignment) {
                throw new NotFoundException('No faculty assigned to this exam');
            }

            // 6. Check for existing pending request
            const existingRequest = await this.studentJoinRequestRepositoryService
                .findPendingRequest(examObjectId, studentObjectId);

            if (existingRequest) {
                return {
                    message: 'Join request already pending',
                    requestId: existingRequest._id.toString(),
                    status: JoinRequestStatus.PENDING
                };
            }

            // 7. Determine if this is a rejoin
            const isRejoin = enrollment.hasJoined && enrollment.leftAt !== null;

            // 8. Create join request
            const joinRequest = await this.studentJoinRequestRepositoryService.create({
                examId: examObjectId,
                studentId: studentObjectId,
                examRoomId: examRoom._id as Types.ObjectId,
                facultyId: facultyAssignment.facultyId,
                status: JoinRequestStatus.PENDING,
                isRejoin
            });

            return {
                message: isRejoin
                    ? 'Rejoin request sent to faculty. Please wait for approval.'
                    : 'Join request sent to faculty. Please wait for approval.',
                requestId: joinRequest._id.toString(),
                status: JoinRequestStatus.PENDING,
                isRejoin
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            console.error('Error requesting join exam:', error);
            throw new InternalServerErrorException('Failed to send join request');
        }
    }

    // Check Join Request Status
    async checkJoinRequestStatus(requestId: string, studentId: string) {
        try {
            const requestObjectId = new Types.ObjectId(requestId);
            const studentObjectId = new Types.ObjectId(studentId);

            const joinRequest = await this.studentJoinRequestRepositoryService
                .findById(requestObjectId);

            if (!joinRequest) {
                throw new NotFoundException('Join request not found');
            }

            if (joinRequest.studentId.toString() !== studentObjectId.toString()) {
                throw new BadRequestException('Unauthorized access to join request');
            }

            return {
                status: joinRequest.status,
                isRejoin: joinRequest.isRejoin,
                approvedAt: joinRequest.approvedAt,
                rejectedAt: joinRequest.rejectedAt,
                rejectionReason: joinRequest.rejectionReason
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Error checking join request status');
        }
    }

    // Join Exam Room (after approval)
    async joinExamRoom(requestId: string, studentId: string) {
        try {
            const requestObjectId = new Types.ObjectId(requestId);
            const studentObjectId = new Types.ObjectId(studentId);

            const joinRequest = await this.studentJoinRequestRepositoryService
                .findById(requestObjectId);

            if (!joinRequest) {
                throw new NotFoundException('Join request not found');
            }

            if (joinRequest.studentId.toString() !== studentObjectId.toString()) {
                throw new BadRequestException('Unauthorized access');
            }

            if (joinRequest.status !== JoinRequestStatus.APPROVED) {
                throw new BadRequestException('Join request has not been approved');
            }

            const exam = await this.examRepositoryService.findById(joinRequest.examId);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            const examRoom = await this.examRoomRepositoryService
                .findById(joinRequest.examRoomId);

            if (!examRoom) {
                throw new NotFoundException('Exam room not found');
            }

            // Generate 100ms auth token
            const authTokenResponse = await this.hms100msService.generateAuthToken(
                examRoom.hmsRoomId,
                studentId,
                'student'
            );

            // Update enrollment
            const enrollment = await this.studentEnrollmentRepositoryService
                .findByExamIdAndStudentId(joinRequest.examId, studentObjectId);

            if (enrollment) {
                await this.studentEnrollmentRepositoryService.update(enrollment._id, {
                    hasJoined: true,
                    joinedAt: new Date()
                });
            }

            return {
                roomId: examRoom.hmsRoomId,
                authToken: authTokenResponse.token,
                examName: exam.examName,
                duration: exam.duration,
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            console.error('Error joining exam room:', error);
            throw new InternalServerErrorException('Failed to join exam room');
        }
    }

    // Update student left status
    async updateStudentLeftStatus(examId: string, studentId: string) {
        try {
            const examObjectId = new Types.ObjectId(examId);
            const studentObjectId = new Types.ObjectId(studentId);

            const enrollment = await this.studentEnrollmentRepositoryService
                .findByExamIdAndStudentId(examObjectId, studentObjectId);

            if (enrollment) {
                await this.studentEnrollmentRepositoryService.update(enrollment._id, {
                    leftAt: new Date()
                });
            }

            return { message: 'Student left status updated' };

        } catch (error) {
            throw new InternalServerErrorException('Error updating student status');
        }
    }

}