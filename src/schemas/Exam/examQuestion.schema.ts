import { Document, Types } from 'mongoose';
import { QuestionType } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamQuestionDocument = ExamQuestion & Document;

@Schema({ _id: false })
export class QuestionOption {

    @Prop({ required: true })
    optionId: string;

    @Prop({ required: true })
    text: string;

}

@Schema({ collection: 'exam_questions', timestamps: true })
export class ExamQuestion {

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(QuestionType) })
    type: string;

    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    marks: number;

    @Prop({ required: true })
    order: number;

    // Optional — which Exam.examSections[] entry this question belongs to.
    // Absent means "no section" (flat question list), for backward
    // compatibility with exams authored before sections existed.
    @Prop({ type: Types.ObjectId })
    examSectionId?: Types.ObjectId;

    // MCQ/MSQ only — always exactly 4 entries
    @Prop({ type: [QuestionOption] })
    options: QuestionOption[];

    // MCQ/MSQ only — MCQ has exactly 1 entry, MSQ has 1 or more
    @Prop({ type: [String] })
    correctOptionIds: string[];

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

}

export const ExamQuestionSchema = SchemaFactory.createForClass(ExamQuestion);

ExamQuestionSchema.index({ examId: 1, order: 1 });
