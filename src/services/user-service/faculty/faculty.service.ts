import moment from 'moment';
import { Types } from 'mongoose';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

// Requests
import { FacultyExamDto } from 'src/api/user/faculty/get-faculty-exams/get-faculty-exams.response';

// Enums
import { ExamMode, ExamStatus, MessageType, ParticipantRole, ParticipantStatus, StudentActionType } from 'src/utils/enum';

// Service
import { AgoraService } from 'src/agora/agora.service';

// Repository
import { AgoraTokenRepositoryService } from 'src/repositories/agora-token-repository/agora-token.repository';
import { ChatMessageRepositoryService } from 'src/repositories/chat-message-repository/chat-message.repository';
import { ExamParticipantRepositoryService } from 'src/repositories/exam-participant-repository/exam-participant.repository';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { JoinRequestRepositoryService } from 'src/repositories/join-request-repository/join-request.repository';
import { StudentActionRepositoryService } from 'src/repositories/student-action-repository/student-action.repository';
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { StudentPersonalDetailRepositoryService } from 'src/repositories/student-personal-detail-repository/student-personal-detail.repository';
import { StudentAcademicDetailRepositoryService } from 'src/repositories/student-academic-detail-repository/student-academic-detail.repository';


@Injectable()
export class FacultyService {
    constructor(
        private readonly examRepository: ExamRepositoryService,
        private readonly examParticipantRepository: ExamParticipantRepositoryService,
        private readonly joinRequestRepository: JoinRequestRepositoryService,
        private readonly agoraTokenRepository: AgoraTokenRepositoryService,
        private readonly chatMessageRepository: ChatMessageRepositoryService,
        private readonly studentActionRepository: StudentActionRepositoryService,
        private readonly agoraService: AgoraService,
        private readonly studentRepository: StudentRepositoryService,
        private readonly userRepository: UserRepositoryService,
        private readonly studentPersonalDetailRepository: StudentPersonalDetailRepositoryService,
        private readonly studentAcademicDetailRepository: StudentAcademicDetailRepositoryService
    ) { }


    // Get Faculty Exam API Endpoint
    async getFacultyExams(facultyId: string, status?: ExamStatus): Promise<FacultyExamDto[]> {
        try {
            // Find all exams where faculty is a participant
            const participants = await this.examParticipantRepository.findByUserId(
                facultyId,
                ParticipantRole.FACULTY
            );

            const exams = await Promise.all(
                participants.map(async (p) => {
                    const exam = (p as any).examId;

                    // Skip AUTO mode exams (faculty only handles PROCTORING mode)
                    if (exam.examMode === ExamMode.AUTO) {
                        return null;
                    }

                    // Get the current status from database (updated by cron job)
                    const examStatus = exam.status;

                    // Faculty can join if exam status is ONGOING
                    const canJoin = examStatus === ExamStatus.ONGOING;

                    // Get student participant counts
                    const studentParticipants = await this.examParticipantRepository.findByExamId(
                        exam._id.toString(),
                        ParticipantRole.STUDENT
                    );

                    const joinedStudents = studentParticipants.filter(
                        sp => sp.status === ParticipantStatus.JOINED
                    ).length;

                    const examDto: FacultyExamDto = {
                        examId: exam._id.toString(),
                        examName: exam.examName,
                        examDate: moment(exam.examDate).format('YYYY-MM-DD'),
                        startTime: exam.startTime,
                        endTime: exam.endTime,
                        duration: exam.duration,
                        status: examStatus,
                        canJoin: canJoin,
                        totalStudents: exam.students?.length || 0,
                        joinedStudents: joinedStudents
                    };

                    return examDto;
                })
            );

            // Filter out null values (AUTO mode exams) and filter by status if provided
            const filteredExams = exams
                .filter(exam => exam !== null)
                .filter(exam => !status || exam.status === status);

            return filteredExams;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch faculty exams');
        }
    }


    // Faculty Join Exam API Endpoint
    async facultyJoinExam(facultyId: string, examId: string) {
        try {
            // Verify exam exists
            const exam = await this.examRepository.findById(examId);
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            // Verify faculty is assigned to this exam
            const participant = await this.examParticipantRepository.findByExamAndUser(
                examId,
                facultyId
            );

            if (!participant || participant.role !== ParticipantRole.FACULTY) {
                throw new BadRequestException('Faculty not assigned to this exam');
            }

            // Generate Agora tokens
            const uid = this.agoraService.generateUid(facultyId, 'faculty');
            const tokens = this.agoraService.generateTokens(
                exam.agoraChannelName,
                uid,
                'publisher'
            );

            // Save tokens to database
            await this.agoraTokenRepository.create({
                examId: new Types.ObjectId(examId),
                userId: new Types.ObjectId(facultyId),
                rtcToken: tokens.rtcToken,
                rtmToken: tokens.rtmToken,
                uid,
                expiresAt: tokens.expiresAt
            });

            // Update participant status
            await this.examParticipantRepository.updateJoinedAt(examId, facultyId);

            // Update exam start time if not started
            if (!exam.startedAt) {
                await this.examRepository.updateStartTime(examId, new Date());
            }

            return {
                rtcToken: tokens.rtcToken,
                rtmToken: tokens.rtmToken,
                channelName: exam.agoraChannelName,
                uid,
                expiresAt: tokens.expiresAt
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to join exam');
        }
    }


    // Get Pending Join Requests API Endpoint
    async getPendingJoinRequests(examId: string) {
        try {
            const requests = await this.joinRequestRepository.findPendingByExam(examId);

            // If no requests found, return empty array
            if (!requests || requests.length === 0) {
                return [];
            }

            // Process only the first request (one by one approach)
            const req = requests[0];

            // Check if studentId exists
            if (!req.studentId) {
                throw new InternalServerErrorException('Invalid join request: student not found');
            }

            // This is actually the User._id stored incorrectly as studentId
            const userId = req.studentId.toString();

            // 1. Get Student document using userId field (NOT Student._id)
            const student = await this.studentRepository.findByUserId(new Types.ObjectId(userId));

            if (!student) {
                throw new NotFoundException(`Student profile not found for user ${userId}`);
            }

            // 2. Get User (for email) - can reuse the userId we already have
            const user = await this.userRepository.findById(new Types.ObjectId(userId));

            if (!user) {
                throw new NotFoundException(`User ${userId} not found`);
            }

            // 3. Get Personal Details (for name)
            const personalDetail = await this.studentPersonalDetailRepository.findById(
                student.personalDetailId
            );

            if (!personalDetail) {
                throw new NotFoundException(`Personal detail ${student.personalDetailId} not found`);
            }

            // 4. Get Academic Details (for roll number)
            const academicDetail = await this.studentAcademicDetailRepository.findById(
                student.academicDetailId
            );

            if (!academicDetail) {
                throw new NotFoundException(`Academic detail ${student.academicDetailId} not found`);
            }

            return [{
                requestId: (req._id as any).toString(),
                studentEmail: user.email,
                studentName: `${personalDetail.firstName} ${personalDetail.lastName}`.trim(),
                studentRollNumber: academicDetail.rollNumber,
                timestamp: req.requestedAt
            }];

        } catch (error) {
            console.log("error", error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch join requests');
        }
    }


    // Approve JoinRequest API Endpoint
    async approveJoinRequest(requestId: string) {
        try {
            const request = await this.joinRequestRepository.findById(requestId);
            if (!request) {
                throw new NotFoundException('Join request not found');
            }

            // Approve request
            await this.joinRequestRepository.approve(requestId);

            // Get exam details
            const exam = await this.examRepository.findById(request.examId.toString());
            if (!exam) {
                throw new NotFoundException('Exam not found');
            }

            // Generate tokens for student
            const uid = this.agoraService.generateUid(
                request.studentId.toString(),
                'student'
            );
            const tokens = this.agoraService.generateTokens(
                exam.agoraChannelName,
                uid,
                'publisher'
            );

            // Save tokens
            await this.agoraTokenRepository.create({
                examId: request.examId,
                userId: request.studentId,
                rtcToken: tokens.rtcToken,
                rtmToken: tokens.rtmToken,
                uid,
                expiresAt: tokens.expiresAt
            });

            // Update participant status
            await this.examParticipantRepository.updateStatus(
                request.examId.toString(),
                request.studentId.toString(),
                ParticipantStatus.JOINED
            );

            return {
                success: true,
                tokens: {
                    rtcToken: tokens.rtcToken,
                    rtmToken: tokens.rtmToken,
                    channelName: exam.agoraChannelName,
                    uid,
                    expiresAt: tokens.expiresAt
                }
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Failed to approve join request');
        }
    }


    // Reject Join Request API Endpoint
    async rejectJoinRequest(requestId: string, reason: string) {
        try {
            const request = await this.joinRequestRepository.findById(requestId);
            if (!request) {
                throw new NotFoundException('Join request not found');
            }

            await this.joinRequestRepository.reject(requestId, reason);

            await this.examParticipantRepository.updateStatus(
                request.examId.toString(),
                request.studentId.toString(),
                ParticipantStatus.REJECTED
            );

            return { success: true };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Failed to reject join request');
        }
    }


    // Send Message API Endpoint
    async sendMessage(data: {
        examId: string;
        senderId: string;
        recipientId?: string;
        message: string;
        type: MessageType;
    }) {
        try {
            const messageDoc = await this.chatMessageRepository.create({
                examId: new Types.ObjectId(data.examId),
                senderId: new Types.ObjectId(data.senderId),
                recipientId: data.recipientId ? new Types.ObjectId(data.recipientId) : undefined,
                message: data.message,
                type: data.type
            });

            return {
                messageId: messageDoc._id as any,
                timestamp: messageDoc.timestamp
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to send message');
        }
    }


    // Get ChatHistory API Endpoint
    async getChatHistory(examId: string, recipientId?: string) {
        try {
            const messages = await this.chatMessageRepository.findByExam(examId);

            let filteredMessages = messages;
            if (recipientId) {
                filteredMessages = messages.filter(
                    msg => msg.recipientId?.toString() === recipientId ||
                        msg.type === MessageType.BROADCAST
                );
            }

            return filteredMessages.map(msg => ({
                messageId: msg._id as any,
                senderId: (msg.senderId as any)._id.toString(),
                senderName: (msg.senderId as any).name,
                recipientId: msg.recipientId ? (msg.recipientId as any)._id.toString() : undefined,
                message: msg.message,
                type: msg.type,
                timestamp: msg.timestamp
            }));
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch chat history');
        }
    }


    // Remove Student API Endpoint
    async removeStudent(examId: string, studentId: string, reason: string) {
        try {
            // Update participant status
            await this.examParticipantRepository.updateStatus(
                examId,
                studentId,
                ParticipantStatus.REMOVED
            );

            // Log action
            await this.studentActionRepository.create({
                examId: new Types.ObjectId(examId),
                studentId: new Types.ObjectId(studentId),
                action: StudentActionType.REMOVED,
                reason
            });

            // Delete Agora tokens
            await this.agoraTokenRepository.deleteByExamAndUser(examId, studentId);

            return { success: true };
        } catch (error) {
            throw new InternalServerErrorException('Failed to remove student');
        }
    }


    // End Exam API Endpoint
    async endExam(examId: string) {
        try {
            // Update exam status
            await this.examRepository.updateEndTime(examId, new Date());

            // Update all participants
            await this.examParticipantRepository.updateAllParticipantsStatus(
                examId,
                ParticipantStatus.EXAM_ENDED
            );

            return { success: true };
        } catch (error) {
            throw new InternalServerErrorException('Failed to end exam');
        }
    }


}