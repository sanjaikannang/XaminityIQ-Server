import { Document, Types } from 'mongoose';
import { AttemptStatus, MediaStatus, SubmissionTrigger, ViolationType } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamAttemptDocument = ExamAttempt & Document;

@Schema({ _id: false })
export class ViolationEntry {

    @Prop({ required: true, enum: Object.values(ViolationType) })
    type: string;

    @Prop({ required: true, default: Date.now })
    occurredAt: Date;

}

export const ViolationEntrySchema = SchemaFactory.createForClass(ViolationEntry);

@Schema({ collection: 'exam_attempts', timestamps: true })
export class ExamAttempt {

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(AttemptStatus), default: AttemptStatus.NOT_STARTED })
    status: string;

    // This student's question sequence — the base authoring order, shuffled at
    // attempt-creation time if the exam's securitySettings.shuffleQuestions is set
    @Prop({ type: [{ type: Types.ObjectId, ref: 'ExamQuestion' }], default: [] })
    questionOrder: Types.ObjectId[];

    // Map of questionId -> shuffled optionId order, populated at attempt-creation
    // time if the exam's securitySettings.shuffleOptions is set; otherwise unset
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

    // Set true on the first logged integrity violation
    @Prop({ default: false })
    isFlagged: boolean;

    // Every logged integrity violation for this attempt, in occurrence order
    @Prop({ type: [ViolationEntrySchema], default: [] })
    violations: ViolationEntry[];

}

export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);

ExamAttemptSchema.index({ examId: 1, studentId: 1 }, { unique: true });
ExamAttemptSchema.index({ examId: 1, status: 1 });
ExamAttemptSchema.index({ roomId: 1 });
ExamAttemptSchema.index({ examId: 1, isFlagged: 1 });
