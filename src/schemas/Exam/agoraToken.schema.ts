import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AgoraTokenDocument = AgoraToken & Document;

@Schema({ timestamps: true })
export class AgoraToken {

    @Prop({ required: true, type: Types.ObjectId, ref: 'Exam' })
    examId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true })
    rtcToken: string;

    @Prop({ required: true })
    rtmToken: string;

    @Prop({ required: true })
    uid: string;

    @Prop({ required: true, type: Date })
    expiresAt: Date;

}

export const AgoraTokenSchema = SchemaFactory.createForClass(AgoraToken);

AgoraTokenSchema.index({ examId: 1, userId: 1 });
