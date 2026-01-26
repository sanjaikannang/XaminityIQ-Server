import { Document, Types } from 'mongoose';
import { ExamMode, ExamStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {

    @Prop({ required: true, enum: ExamMode })
    examMode: ExamMode;

    @Prop({ required: true })
    examName: string;

    @Prop({ required: true, type: Date })
    date: Date;

    @Prop({ required: true })
    time: string;

    @Prop({ required: true })
    duration: number; // in minutes

    @Prop({ required: true })
    agoraChannelName: string;

    @Prop({
        required: true,
        enum: ExamStatus,
        default: ExamStatus.UPCOMING
    })
    status: ExamStatus;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Admin' })
    createdBy: Types.ObjectId;

    @Prop({ type: Date })
    startedAt: Date;

    @Prop({ type: Date })
    endedAt: Date;

}

export const ExamSchema = SchemaFactory.createForClass(Exam);