import { Document, Types } from 'mongoose';
import { AttemptStatus, MediaStatus, SubmissionTrigger } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamAttemptDocument = ExamAttempt & Document;

@Schema({ collection: 'exam_attempts', timestamps: true })
export class ExamAttempt {

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(AttemptStatus), default: AttemptStatus.NOT_STARTED })
    status: string;

    // This student's question sequence — always the base authoring order until
    // shuffling is implemented (see Sub-Module 8, a later phase)
    @Prop({ type: [{ type: Types.ObjectId, ref: 'ExamQuestion' }], default: [] })
    questionOrder: Types.ObjectId[];

    // Map of questionId -> shuffled optionId order. Unused until shuffling is built.
    @Prop({ type: Object })
    optionOrder: Record<string, string[]>;

    // PROCTORING only — unused until that phase
    @Prop({ type: Types.ObjectId, ref: 'ExamRoom' })
    roomId: Types.ObjectId;

    @Prop()
    startedAt: Date;

    @Prop()
    submittedAt: Date;

    @Prop({ enum: Object.values(SubmissionTrigger) })
    submissionTrigger: string;

    @Prop({ required: true, enum: Object.values(MediaStatus), default: MediaStatus.PENDING_UPLOAD })
    mediaStatus: string;

    @Prop()
    objectiveScore: number;

    @Prop()
    writtenScore: number;

    @Prop()
    totalScore: number;

    @Prop()
    passed: boolean;

    // Set true on the first logged integrity violation — unused until Sub-Module 8
    @Prop({ default: false })
    isFlagged: boolean;

}

export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);

ExamAttemptSchema.index({ examId: 1, studentId: 1 }, { unique: true });
ExamAttemptSchema.index({ examId: 1, status: 1 });
ExamAttemptSchema.index({ roomId: 1 });
ExamAttemptSchema.index({ examId: 1, isFlagged: 1 });
