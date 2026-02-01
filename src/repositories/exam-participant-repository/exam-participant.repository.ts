import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ParticipantRole, ParticipantStatus } from 'src/utils/enum';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ExamParticipant, ExamParticipantDocument } from 'src/schemas/Exam/examParticipant.schema';

@Injectable()
export class ExamParticipantRepositoryService {
    constructor(
        @InjectModel(ExamParticipant.name)
        private examParticipantModel: Model<ExamParticipantDocument>
    ) { }

    async create(participantData: {
        examId: Types.ObjectId;
        userId: Types.ObjectId;
        role: ParticipantRole;
    }): Promise<ExamParticipantDocument> {
        try {
            const participant = new this.examParticipantModel(participantData);
            return participant.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async bulkCreate(participants: Array<{
        examId: Types.ObjectId;
        userId: Types.ObjectId;
        role: ParticipantRole;
        status: ParticipantStatus;
    }>): Promise<ExamParticipantDocument[]> {
        try {
            return this.examParticipantModel.insertMany(participants);
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByExamAndUser(
        examId: string,
        userId: string
    ): Promise<ExamParticipantDocument | null> {
        try {
            return this.examParticipantModel.findOne({
                examId: new Types.ObjectId(examId),
                userId: new Types.ObjectId(userId)
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByExamId(examId: string, role?: ParticipantRole): Promise<ExamParticipantDocument[]> {
        try {
            const query: any = { examId: new Types.ObjectId(examId) };

            if (role) {
                query.role = role;
            }

            return this.examParticipantModel
                .find(query)
                .populate('userId')
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateStatus(
        examId: string,
        userId: string,
        status: ParticipantStatus
    ): Promise<ExamParticipantDocument | null> {
        try {
            return this.examParticipantModel.findOneAndUpdate(
                {
                    examId: new Types.ObjectId(examId),
                    userId: new Types.ObjectId(userId)
                },
                { status },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateJoinedAt(
        examId: string,
        userId: string
    ): Promise<ExamParticipantDocument | null> {
        try {
            return this.examParticipantModel.findOneAndUpdate(
                {
                    examId: new Types.ObjectId(examId),
                    userId: new Types.ObjectId(userId)
                },
                {
                    joinedAt: new Date(),
                    status: ParticipantStatus.JOINED
                },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByUserId(
        userId: string,
        role: ParticipantRole
    ): Promise<ExamParticipantDocument[]> {
        try {
            return this.examParticipantModel.find({
                userId: new Types.ObjectId(userId),
                role
            })
                .populate('examId')
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findStudentsByExam(examId: string): Promise<ExamParticipantDocument[]> {
        try {
            return this.examParticipantModel.find({
                examId: new Types.ObjectId(examId),
                role: ParticipantRole.STUDENT
            })
                .populate('userId')
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateAllParticipantsStatus(
        examId: string,
        status: ParticipantStatus
    ): Promise<any> {
        try {
            return this.examParticipantModel.updateMany(
                { examId: new Types.ObjectId(examId) },
                { status }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}