import { Document, Types } from 'mongoose';
import { JoinRequestStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type JoinRequestDocument = JoinRequest & Document;

@Schema({ timestamps: true })
export class JoinRequest {

    @Prop({ required: true, type: Types.ObjectId, ref: 'Exam' })
    examId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Student' })
    studentId: Types.ObjectId;

    @Prop({
        required: true,
        enum: JoinRequestStatus,
        default: JoinRequestStatus.PENDING
    })
    status: JoinRequestStatus;

    @Prop({ required: true, type: Object })
    deviceStatus: {
        camera: boolean;
        microphone: boolean;
        screenShare: boolean;
        fullscreen: boolean;
    };

    @Prop({ type: Date })
    requestedAt: Date;

    @Prop({ type: Date })
    approvedAt: Date;

    @Prop({ type: Date })
    rejectedAt: Date;

    @Prop({ type: String })
    reason: string;

}

export const JoinRequestSchema = SchemaFactory.createForClass(JoinRequest);

JoinRequestSchema.index({ examId: 1, status: 1 });