import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JoinRequestStatus } from 'src/utils/enum';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JoinRequest, JoinRequestDocument } from 'src/schemas/Exam/joinRequest.schema';

@Injectable()
export class JoinRequestRepositoryService {
    constructor(
        @InjectModel(JoinRequest.name)
        private joinRequestModel: Model<JoinRequestDocument>,
    ) { }

    async create(requestData: {
        examId: Types.ObjectId;
        studentId: Types.ObjectId;
        // deviceStatus: any;
    }): Promise<JoinRequestDocument> {
        try {
            const request = new this.joinRequestModel({
                ...requestData,
                requestedAt: new Date()
            });
            return request.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findById(requestId: string): Promise<JoinRequestDocument | null> {
        try {
            return this.joinRequestModel.findById(requestId).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findPendingByExam(examId: string): Promise<JoinRequestDocument[]> {
        try {
            return this.joinRequestModel.find({
                examId: new Types.ObjectId(examId),
                status: JoinRequestStatus.PENDING
            })
                // .populate('studentId')
                .sort({ requestedAt: 1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async approve(requestId: string): Promise<JoinRequestDocument | null> {
        try {
            return this.joinRequestModel.findByIdAndUpdate(
                requestId,
                {
                    status: JoinRequestStatus.APPROVED,
                    approvedAt: new Date()
                },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async reject(requestId: string, reason: string): Promise<JoinRequestDocument | null> {
        try {
            return this.joinRequestModel.findByIdAndUpdate(
                requestId,
                {
                    status: JoinRequestStatus.REJECTED,
                    rejectedAt: new Date(),
                    reason
                },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByExamAndStudent(
        examId: string,
        studentId: string
    ): Promise<JoinRequestDocument | null> {
        try {
            return this.joinRequestModel.findOne({
                examId: new Types.ObjectId(examId),
                studentId: new Types.ObjectId(studentId)
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}