import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ParticipantRole, ParticipantStatus } from 'src/utils/enum';

export type ExamParticipantDocument = ExamParticipant & Document;

@Schema({ timestamps: true })
export class ExamParticipant {

    @Prop({ required: true, type: Types.ObjectId, ref: 'Exam' })
    examId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({
        required: true,
        enum: ParticipantRole
    })
    role: ParticipantRole;

    @Prop({
        required: true,
        enum: ParticipantStatus,
        default: ParticipantStatus.INVITED
    })
    status: ParticipantStatus;

    @Prop({ type: Date })
    joinedAt: Date;

    @Prop({ type: Date })
    leftAt: Date;

}

export const ExamParticipantSchema = SchemaFactory.createForClass(ExamParticipant);

ExamParticipantSchema.index({ examId: 1, userId: 1 });