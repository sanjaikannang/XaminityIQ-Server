import { Types } from 'mongoose';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

// Enums
import { ExamStatus, MessageType, ParticipantRole, ParticipantStatus, StudentActionType } from 'src/utils/enum';

// Repository
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamParticipantRepositoryService } from 'src/repositories/exam-participant-repository/exam-participant.repository';
import { JoinRequestRepositoryService } from 'src/repositories/join-request-repository/join-request.repository';
import { AgoraTokenRepositoryService } from 'src/repositories/agora-token-repository/agora-token.repository';
import { ChatMessageRepositoryService } from 'src/repositories/chat-message-repository/chat-message.repository';
import { StudentActionRepositoryService } from 'src/repositories/student-action-repository/student-action.repository';


@Injectable()
export class StudentService {
    constructor(
        private readonly examRepository: ExamRepositoryService,
        private readonly examParticipantRepository: ExamParticipantRepositoryService,
        private readonly joinRequestRepository: JoinRequestRepositoryService,
        private readonly agoraTokenRepository: AgoraTokenRepositoryService,
        private readonly chatMessageRepository: ChatMessageRepositoryService,
        private readonly studentActionRepository: StudentActionRepositoryService
    ) { }

    async getStudentExams(studentId: string, status?: ExamStatus) {
        try {
            const participants = await this.examParticipantRepository.findByUserId(
                studentId,
                ParticipantRole.STUDENT
            );

            const exams = participants
                .map(p => {
                    const exam = (p as any).examId;
                    return {
                        examId: exam._id.toString(),
                        examName: exam.examName,
                        date: exam.date,
                        time: exam.time,
                        duration: exam.duration,
                        status: exam.status,
                        myStatus: p.status
                    };
                })
                .filter(exam => !status || exam.status === status);

            return exams;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch student exams');
        }
    }

    async requestToJoinExam(data: {
        examId: string;
        studentId: string;
        deviceStatus: any;
    }) {
        try {
            // Check if already requested
            const existing = await this.joinRequestRepository.findByExamAndStudent(
                data.examId,
                data.studentId
            );

            if (existing) {
                throw new ConflictException('Join request already exists');
            }

            const request = await this.joinRequestRepository.create({
                examId: new Types.ObjectId(data.examId),
                studentId: new Types.ObjectId(data.studentId),
                deviceStatus: data.deviceStatus
            });

            // Update participant status to waiting
            await this.examParticipantRepository.updateStatus(
                data.examId,
                data.studentId,
                ParticipantStatus.WAITING
            );

            return {
                requestId: request._id as any,
                status: request.status,
                timestamp: request.requestedAt
            };
        } catch (error) {
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException('Failed to create join request');
        }
    }

    async checkJoinRequestStatus(requestId: string) {
        try {
            const request = await this.joinRequestRepository.findById(requestId);
            if (!request) {
                throw new NotFoundException('Join request not found');
            }

            const result: any = {
                status: request.status
            };

            if (request.status === 'REJECTED' && request.reason) {
                result.reason = request.reason;
            }

            if (request.status === 'APPROVED') {
                const token = await this.agoraTokenRepository.findByExamAndUser(
                    request.examId.toString(),
                    request.studentId.toString()
                );

                if (token) {
                    const exam = await this.examRepository.findById(request.examId.toString());
                    result.tokens = {
                        rtcToken: token.rtcToken,
                        rtmToken: token.rtmToken,
                        channelName: exam?.agoraChannelName,
                        uid: token.uid,
                        expiresAt: token.expiresAt
                    };
                }
            }

            return result;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Failed to check join request status');
        }
    }

    async finishExam(examId: string, studentId: string) {
        try {
            // Update participant status
            const participant = await this.examParticipantRepository.updateStatus(
                examId,
                studentId,
                ParticipantStatus.FINISHED
            );

            // Log action
            await this.studentActionRepository.create({
                examId: new Types.ObjectId(examId),
                studentId: new Types.ObjectId(studentId),
                action: StudentActionType.FINISHED
            });

            const duration = participant?.joinedAt
                ? Math.floor((new Date().getTime() - participant.joinedAt.getTime()) / 60000)
                : 0;

            return {
                success: true,
                duration,
                timestamp: new Date()
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to finish exam');
        }
    }

    async getStudentMessages(examId: string, studentId: string) {
        try {
            const messages = await this.chatMessageRepository.findByStudent(examId, studentId);

            return messages.map(msg => ({
                messageId: msg._id as any,
                senderId: (msg.senderId as any)._id.toString(),
                senderName: (msg.senderId as any).name,
                message: msg.message,
                type: msg.type,
                timestamp: msg.timestamp,
                isFromFaculty: msg.recipientId?.toString() === studentId || msg.type === MessageType.BROADCAST
            }));
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch messages');
        }
    }

}