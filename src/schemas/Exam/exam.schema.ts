import { Document, Types } from 'mongoose';
import { ExamMode, ExamStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamDocument = Exam & Document<Types.ObjectId>;

@Schema({ timestamps: true })
export class Exam {
    @Prop({ required: true })
    examName: string;

    @Prop({ required: true })
    examDate: Date;

    @Prop({ required: true })
    startTime: string; // Format: "HH:mm"

    @Prop({ required: true })
    endTime: string; // Format: "HH:mm"

    @Prop({ required: true })
    duration: number; // Duration in minutes

    @Prop({ required: true, enum: Object.values(ExamMode) })
    mode: ExamMode;

    @Prop({
        required: true,
        enum: Object.values(ExamStatus),
        default: ExamStatus.SCHEDULED
    })
    status: ExamStatus;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

// Indexes
ExamSchema.index({ examDate: 1, startTime: 1 });
ExamSchema.index({ status: 1 });
ExamSchema.index({ mode: 1 });