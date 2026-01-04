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
import { StudentRepositoryService } from "src/repositories/student-repository/student.repository";
import { ExamStatus, JoinRequestStatus } from "src/utils/enum";

@Injectable()
export class FacultyService {
    constructor(
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly studentEnrollmentRepositoryService: StudentEnrollmentRepositoryService,
        private readonly facultyAssignmentRepositoryService: FacultyAssignmentRepositoryService,
        private readonly hms100msService: Hms100msService,
        private readonly studentJoinRequestRepositoryService: ,
        private readonly studentRepositoryService: StudentRepositoryService
    ) { }

    // Get Exams API Endpoint
    async getExams(facultyId: string) {
        try {
            const facultyObjectId = new Types.ObjectId(facultyId);
            const assignments = await this.facultyAssignmentRepositoryService
                .findByFacultyId(facultyObjectId);

            if (!assignments || assignments.length === 0) {
                return [];
            }

            const examIds = assignments.map(assignment => assignment.examId);
            const exams = await this.examRepositoryService.findByIds(examIds);
            const facultyExams: FacultyExam[] = [];

            for (const exam of exams) {
                const assignment = assignments.find(
                    a => a.examId.toString() === exam._id.toString()
                );

                if (!assignment) continue;

                const examRoom = await this.examRoomRepositoryService
                    .findByExamId(exam._id);

                const enrolledStudents = await this.studentEnrollmentRepositoryService
                    .countByExamId(exam._id);

                // Check if within exam time window
                const now = new Date();
                const examDate = new Date(exam.examDate);
                const [startHour, startMin] = exam.startTime.split(':').map(Number);
                const [endHour, endMin] = exam.endTime.split(':').map(Number);

                examDate.setHours(startHour, startMin, 0, 0);
                const examEndDate = new Date(exam.examDate);
                examEndDate.setHours(endHour, endMin, 0, 0);

                const isWithinExamTime = now >= examDate && now <= examEndDate;
                const canMonitor = !!(
                    examRoom &&
                    exam.status === ExamStatus.ONGOING &&
                    isWithinExamTime
                );

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
                    // canMonitor
                });
            }

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

            const exam = await this.examRepositoryService.findById(examObjectId);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            const assignment = await this.facultyAssignmentRepositoryService
                .findByExamIdAndFacultyId(examObjectId, facultyObjectId);

            if (!assignment) {
                throw new BadRequestException('You are not assigned to monitor this exam');
            }

            const examRoom = await this.examRoomRepositoryService
                .findByExamId(examObjectId);

            if (!examRoom || !examRoom.hmsRoomId) {
                throw new BadRequestException('Exam room has not been created yet');
            }

            if (exam.status === ExamStatus.COMPLETED) {
                throw new BadRequestException('This exam has already been completed');
            }

            // Check if within exam time window
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

            const authTokenResponse = await this.hms100msService.generateAuthToken(
                examRoom.hmsRoomId,
                facultyId,
                'proctor'
            );

            const totalStudents = await this.studentEnrollmentRepositoryService
                .countByExamId(examObjectId);

            // Update faculty assignment join time
            await this.facultyAssignmentRepositoryService.update(assignment._id, {
                joinedAt: new Date()
            });

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

    // Get Pending Join Requests
    async getPendingJoinRequests(examId: string, facultyId: string) {
        try {
            const examObjectId = new Types.ObjectId(examId);
            const facultyObjectId = new Types.ObjectId(facultyId);

            // Verify faculty is assigned to this exam
            const assignment = await this.facultyAssignmentRepositoryService
                .findByExamIdAndFacultyId(examObjectId, facultyObjectId);

            if (!assignment) {
                throw new BadRequestException('You are not assigned to this exam');
            }

            const requests = await this.studentJoinRequestRepositoryService
                .findPendingRequestsByExamId(examObjectId);

            const requestsWithDetails = await Promise.all(
                requests.map(async (request) => {
                    const student = await this.studentRepositoryService
                        .findById(request.studentId);

                    return {
                        requestId: request._id.toString(),
                        studentId: request.studentId.toString(),
                        studentName: student?.name || 'Unknown',
                        isRejoin: request.isRejoin,
                        createdAt: request.createdAt
                    };
                })
            );

            return requestsWithDetails;

        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error getting join requests');
        }
    }

    // Approve Join Request
    async approveJoinRequest(requestId: string, facultyId: string) {
        try {
            const requestObjectId = new Types.ObjectId(requestId);
            const facultyObjectId = new Types.ObjectId(facultyId);

            const joinRequest = await this.studentJoinRequestRepositoryService
                .findById(requestObjectId);

            if (!joinRequest) {
                throw new NotFoundException('Join request not found');
            }

            if (joinRequest.facultyId.toString() !== facultyObjectId.toString()) {
                throw new BadRequestException('Unauthorized to approve this request');
            }

            if (joinRequest.status !== JoinRequestStatus.PENDING) {
                throw new BadRequestException('Request has already been processed');
            }

            await this.studentJoinRequestRepositoryService.update(requestObjectId, {
                status: JoinRequestStatus.APPROVED,
                approvedAt: new Date(),
                reviewedBy: facultyObjectId
            });

            return {
                message: 'Join request approved',
                requestId: requestId
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Error approving join request');
        }
    }

    // Reject Join Request
    async rejectJoinRequest(requestId: string, facultyId: string, reason?: string) {
        try {
            const requestObjectId = new Types.ObjectId(requestId);
            const facultyObjectId = new Types.ObjectId(facultyId);

            const joinRequest = await this.studentJoinRequestRepositoryService
                .findById(requestObjectId);

            if (!joinRequest) {
                throw new NotFoundException('Join request not found');
            }

            if (joinRequest.facultyId.toString() !== facultyObjectId.toString()) {
                throw new BadRequestException('Unauthorized to reject this request');
            }

            if (joinRequest.status !== JoinRequestStatus.PENDING) {
                throw new BadRequestException('Request has already been processed');
            }

            await this.studentJoinRequestRepositoryService.update(requestObjectId, {
                status: JoinRequestStatus.REJECTED,
                rejectedAt: new Date(),
                reviewedBy: facultyObjectId,
                rejectionReason: reason || 'No reason provided'
            });

            return {
                message: 'Join request rejected',
                requestId: requestId
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Error rejecting join request');
        }
    }

    // Remove Student from Exam
    async removeStudent(examId: string, studentId: string, facultyId: string, reason: string) {
        try {
            const examObjectId = new Types.ObjectId(examId);
            const studentObjectId = new Types.ObjectId(studentId);
            const facultyObjectId = new Types.ObjectId(facultyId);

            // Verify faculty is assigned
            const assignment = await this.facultyAssignmentRepositoryService
                .findByExamIdAndFacultyId(examObjectId, facultyObjectId);

            if (!assignment) {
                throw new BadRequestException('You are not assigned to this exam');
            }

            // Update enrollment status
            const enrollment = await this.studentEnrollmentRepositoryService
                .findByExamIdAndStudentId(examObjectId, studentObjectId);

            if (enrollment) {
                await this.studentEnrollmentRepositoryService.update(enrollment._id, {
                    status: 'removed',
                    leftAt: new Date()
                });
            }

            // You can also use 100ms API to remove the student from the room
            // await this.hms100msService.removeParticipant(roomId, studentId);

            return {
                message: 'Student removed from exam',
                studentId: studentId,
                reason: reason
            };

        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error removing student');
        }
    }

}