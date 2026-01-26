import { Document, Types } from 'mongoose';
import { MessageType } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {

    @Prop({ required: true, type: Types.ObjectId, ref: 'Exam' })
    examId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    senderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    recipientId: Types.ObjectId;

    @Prop({ required: true })
    message: string;

    @Prop({
        required: true,
        enum: MessageType
    })
    type: MessageType;

    @Prop({ required: true, type: Date, default: Date.now })
    timestamp: Date;

}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ examId: 1, timestamp: 1 });
