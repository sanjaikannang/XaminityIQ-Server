import { Document, Types } from 'mongoose';
import { ChatRecipientType, ChatSenderRole } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamRoomChatMessageDocument = ExamRoomChatMessage & Document;

@Schema({ collection: 'exam_room_chat_messages' })
export class ExamRoomChatMessage {

    @Prop({ type: Types.ObjectId, ref: 'ExamRoom', required: true })
    roomId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(ChatSenderRole) })
    senderRole: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    senderId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(ChatRecipientType) })
    recipientType: string;

    // Set when recipientType is INDIVIDUAL
    @Prop({ type: Types.ObjectId, ref: 'Student' })
    recipientStudentId: Types.ObjectId;

    // Unused this phase — only relevant once mixed-exam rooms are allowed
    @Prop({ type: Types.ObjectId, ref: 'Exam' })
    examIdFilter: Types.ObjectId;

    @Prop({ required: true })
    message: string;

    @Prop({ required: true })
    sentAt: Date;

}

export const ExamRoomChatMessageSchema = SchemaFactory.createForClass(ExamRoomChatMessage);

ExamRoomChatMessageSchema.index({ roomId: 1, sentAt: 1 });
