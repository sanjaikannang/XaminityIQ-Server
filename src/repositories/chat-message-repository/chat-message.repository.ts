import { Model, Types } from 'mongoose';
import { MessageType } from 'src/utils/enum';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChatMessage, ChatMessageDocument } from 'src/schemas/Exam/chatMessage.schema';

@Injectable()
export class ChatMessageRepositoryService {
    constructor(
        @InjectModel(ChatMessage.name)
        private chatMessageModel: Model<ChatMessageDocument>,
    ) { }

    async create(messageData: {
        examId: Types.ObjectId;
        senderId: Types.ObjectId;
        recipientId?: Types.ObjectId;
        message: string;
        type: MessageType;
    }): Promise<ChatMessageDocument> {
        try {
            const chatMessage = new this.chatMessageModel(messageData);
            return chatMessage.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByExam(examId: string): Promise<ChatMessageDocument[]> {
        try {
            return this.chatMessageModel.find({
                examId: new Types.ObjectId(examId)
            })
                .populate('senderId', 'name email')
                .populate('recipientId', 'name email')
                .sort({ timestamp: 1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByStudent(
        examId: string,
        studentId: string
    ): Promise<ChatMessageDocument[]> {
        try {
            return this.chatMessageModel.find({
                examId: new Types.ObjectId(examId),
                $or: [
                    { senderId: new Types.ObjectId(studentId) },
                    { recipientId: new Types.ObjectId(studentId) },
                    { type: MessageType.BROADCAST }
                ]
            })
                .populate('senderId', 'name email')
                .sort({ timestamp: 1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}
