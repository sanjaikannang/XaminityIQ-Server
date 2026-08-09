import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExamRoomChatMessage, ExamRoomChatMessageDocument } from 'src/schemas/Exam/examRoomChatMessage.schema';

@Injectable()
export class ExamRoomChatMessageRepositoryService {
    constructor(
        @InjectModel(ExamRoomChatMessage.name) private examRoomChatMessageModel: Model<ExamRoomChatMessageDocument>,
    ) { }


    // Persist a chat message
    async create(data: Partial<ExamRoomChatMessage>): Promise<ExamRoomChatMessageDocument> {
        try {
            const message = new this.examRoomChatMessageModel(data);
            return await message.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find chat history for a room, oldest first, capped at limit
    async findByRoomId(roomId: string | Types.ObjectId, limit: number = 200): Promise<ExamRoomChatMessageDocument[]> {
        try {
            return await this.examRoomChatMessageModel
                .find({ roomId: new Types.ObjectId(roomId) })
                .sort({ sentAt: 1 })
                .limit(limit)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
