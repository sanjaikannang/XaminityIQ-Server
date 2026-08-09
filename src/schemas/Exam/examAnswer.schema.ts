import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamAnswerDocument = ExamAnswer & Document;

@Schema({ _id: false })
export class AnswerPage {

    @Prop({ required: true })
    pageNumber: number;

    @Prop({ required: true })
    cloudinaryUrl: string;

    @Prop({ required: true })
    uploadedAt: Date;

}

@Schema({ collection: 'exam_answers', timestamps: { createdAt: false, updatedAt: true } })
export class ExamAnswer {

    @Prop({ type: Types.ObjectId, ref: 'ExamAttempt', required: true })
    attemptId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ExamQuestion', required: true })
    questionId: Types.ObjectId;

    // MCQ only
    @Prop()
    selectedOptionId: string;

    // MSQ only
    @Prop({ type: [String] })
    selectedOptionIds: string[];

    // WRITTEN only — unused until Sub-Module 4's QR/mobile-capture phase
    @Prop()
    qrTokenHash: string;

    @Prop()
    qrGeneratedAt: Date;

    @Prop()
    qrTokenExpiresAt: Date;

    @Prop()
    qrScannedAt: Date;

    @Prop({ type: [AnswerPage], default: [] })
    pages: AnswerPage[];

    // WRITTEN only — true once the student clicks "Upload Answer" on desktop.
    // MCQ/MSQ are implicitly finalized at exam submission.
    @Prop({ default: false })
    isFinalized: boolean;

    @Prop()
    marksAwarded: number;

    // WRITTEN only — set during Evaluation (a later phase)
    @Prop({ type: Types.ObjectId, ref: 'User' })
    evaluatedBy: Types.ObjectId;

    @Prop()
    evaluatedAt: Date;

    @Prop()
    remarks: string;

}

export const ExamAnswerSchema = SchemaFactory.createForClass(ExamAnswer);

ExamAnswerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });
ExamAnswerSchema.index({ qrTokenHash: 1 }, { unique: true, sparse: true });
ExamAnswerSchema.index({ evaluatedBy: 1, isFinalized: 1 });
