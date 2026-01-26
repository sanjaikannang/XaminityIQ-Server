import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AgoraToken, AgoraTokenDocument } from 'src/schemas/Exam/agoraToken.schema';

@Injectable()
export class AgoraTokenRepositoryService {
    constructor(
        @InjectModel(AgoraToken.name)
        private agoraTokenModel: Model<AgoraTokenDocument>,
    ) { }

    async create(tokenData: {
        examId: Types.ObjectId;
        userId: Types.ObjectId;
        rtcToken: string;
        rtmToken: string;
        uid: string;
        expiresAt: Date;
    }): Promise<AgoraTokenDocument> {
        try {
            const token = new this.agoraTokenModel(tokenData);
            return token.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByExamAndUser(
        examId: string,
        userId: string
    ): Promise<AgoraTokenDocument | null> {
        try {
            return this.agoraTokenModel.findOne({
                examId: new Types.ObjectId(examId),
                userId: new Types.ObjectId(userId)
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async deleteByExamAndUser(examId: string, userId: string): Promise<any> {
        try {
            return this.agoraTokenModel.deleteOne({
                examId: new Types.ObjectId(examId),
                userId: new Types.ObjectId(userId)
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}
