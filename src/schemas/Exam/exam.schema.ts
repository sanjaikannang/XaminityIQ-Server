import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ExamMode, ExamStatus } from 'src/utils/enum';

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {

    @Prop({ required: true })
    examName: string;

    @Prop({ required: true })
    examDate: string; // YYYY-MM-DD

    @Prop({ required: true })
    startTime: string; // HH:mm

    @Prop({ required: true })
    endTime: string; // HH:mm

    @Prop({ required: true })
    duration: number; // in minutes

    @Prop({
        type: String,
        enum: Object.values(ExamMode),
        required: true,
    })
    mode: ExamMode;

    @Prop({
        type: String,
        enum: Object.values(ExamStatus),
        default: ExamStatus.DRAFT,
    })
    status: ExamStatus;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId; // Super Admin
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

// Indexes
ExamSchema.index({ examDate: 1, startTime: 1 });
ExamSchema.index({ mode: 1, status: 1 });
