import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
    QuestionType,
    DifficultyLevel,
    BloomsTaxonomy,
    Status
} from 'src/utils/enum';

export type QuestionBankDocument = QuestionBank & Document;
export type ExamSectionDocument = ExamSection & Document;

// Media schema for reusability
@Schema({ _id: false })
export class QuestionMedia {
    @Prop({ required: true, enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'] })
    mediaType: string;

    @Prop({ required: true })
    mediaUrl: string;

    @Prop()
    mediaDescription?: string;

    @Prop()
    mediaSize?: number;

    @Prop()
    mimeType?: string;
}

// Option schema for MCQ and MULTIPLE_SELECT questions
@Schema({ _id: false })
export class QuestionOption {
    @Prop({ required: true })
    optionText: string;

    @Prop({ required: true })
    isCorrect: boolean;

    @Prop()
    explanation?: string;

    @Prop({ type: [QuestionMedia] })
    optionMedia?: QuestionMedia[];
}

// Grading criteria for subjective questions
@Schema({ _id: false })
export class GradingCriteria {
    @Prop({ required: true })
    criteriaName: string;

    @Prop({ required: true, min: 0 })
    maxMarks: number;

    @Prop()
    description?: string;
}

// Solution details
@Schema({ _id: false })
export class Solution {
    @Prop()
    solutionText?: string;

    @Prop({ type: [QuestionMedia] })
    solutionMedia?: QuestionMedia[];

    @Prop({ type: [String] })
    stepByStepSolution?: string[];

    @Prop({ type: [String] })
    referenceLinks?: string[];

    @Prop({ type: [GradingCriteria] })
    gradingRubric?: GradingCriteria[];
}

// Answer details combining all question types
@Schema({ _id: false })
export class AnswerDetails {
    // For MCQ and MULTIPLE_SELECT
    @Prop({ type: [QuestionOption] })
    options?: QuestionOption[];

    // For other question types
    @Prop()
    correctAnswer?: string;

    @Prop({ type: [String] })
    acceptableAnswers?: string[];

    @Prop({ default: false })
    caseSensitive?: boolean;

    @Prop({ type: Solution })
    solution?: Solution;
}

// Main Question Bank Schema
@Schema({ timestamps: true })
export class QuestionBank {
    @Prop({ required: true, enum: QuestionType })
    questionType: QuestionType;

    @Prop({ required: true })
    questionText: string;

    @Prop({ type: [QuestionMedia] })
    questionMedia?: QuestionMedia[];

    @Prop({ required: true, enum: DifficultyLevel })
    difficultyLevel: DifficultyLevel;

    @Prop({ enum: BloomsTaxonomy })
    bloomsTaxonomy?: BloomsTaxonomy;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop({ required: true, min: 0 })
    marks: number;

    @Prop({ min: 0 })
    timeLimit?: number; // per-question time limit in minutes

    @Prop({ type: AnswerDetails, required: true })
    answerDetails: AnswerDetails;

    // Subject and academic information
    @Prop({ required: true })
    subject: string;

    @Prop()
    chapter?: string;

    @Prop()
    topic?: string;

    @Prop()
    subtopic?: string;

    @Prop()
    academicYear?: string;

    @Prop()
    semester?: string;

    @Prop()
    course?: string;

    @Prop()
    branch?: string;

    // Question metadata
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    reviewedBy?: Types.ObjectId;

    @Prop()
    reviewedAt?: Date;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;

    // Usage statistics
    @Prop({ default: 0 })
    timesUsed: number;

    @Prop({ default: 0 })
    correctAttempts: number;

    @Prop({ default: 0 })
    totalAttempts: number;

    @Prop()
    averageTimeSpent?: number; // in seconds

    @Prop()
    lastUsedAt?: Date;

    // Question versioning
    @Prop({ default: 1 })
    version: number;

    @Prop({ type: Types.ObjectId, ref: 'QuestionBank' })
    parentQuestionId?: Types.ObjectId; // for versioning

    @Prop({ default: false })
    isLatestVersion: boolean;
}

// Exam Section Schema (to organize questions within an exam)
@Schema({ timestamps: true })
export class ExamSection {
    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ required: true })
    sectionName: string;

    @Prop({ required: true, min: 0 })
    sectionMarks: number;

    @Prop()
    sectionInstructions?: string;

    @Prop({ default: 1 })
    sectionOrder: number;

    // Questions in this section
    @Prop({
        type: [{
            questionId: { type: Types.ObjectId, ref: 'QuestionBank', required: true },
            questionOrder: { type: Number, required: true },
            customMarks: { type: Number }, // Override question's default marks
            customTimeLimit: { type: Number }, // Override question's default time limit
            isRequired: { type: Boolean, default: true }
        }]
    })
    questions: Array<{
        questionId: Types.ObjectId;
        questionOrder: number;
        customMarks?: number;
        customTimeLimit?: number;
        isRequired: boolean;
    }>;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const QuestionBankSchema = SchemaFactory.createForClass(QuestionBank);
export const ExamSectionSchema = SchemaFactory.createForClass(ExamSection);

// Question Bank Indexes
QuestionBankSchema.index({ createdBy: 1 });
QuestionBankSchema.index({ status: 1 });
QuestionBankSchema.index({ questionType: 1 });
QuestionBankSchema.index({ difficultyLevel: 1 });
QuestionBankSchema.index({ subject: 1 });
QuestionBankSchema.index({ bloomsTaxonomy: 1 });
QuestionBankSchema.index({ tags: 1 });
QuestionBankSchema.index({ timesUsed: -1 });
QuestionBankSchema.index({ createdAt: -1 });

// Compound indexes for better query performance
QuestionBankSchema.index({ subject: 1, questionType: 1 });
QuestionBankSchema.index({ subject: 1, difficultyLevel: 1 });
QuestionBankSchema.index({ status: 1, subject: 1 });
QuestionBankSchema.index({ createdBy: 1, status: 1 });
QuestionBankSchema.index({ academicYear: 1, semester: 1, subject: 1 });
QuestionBankSchema.index({ course: 1, branch: 1, subject: 1 });
QuestionBankSchema.index({ parentQuestionId: 1, version: -1 });

// Text search index for question content
QuestionBankSchema.index({
    questionText: 'text',
    tags: 'text',
    subject: 'text',
    chapter: 'text',
    topic: 'text'
});

// Exam Section Indexes
ExamSectionSchema.index({ examId: 1 });
ExamSectionSchema.index({ examId: 1, sectionOrder: 1 });
ExamSectionSchema.index({ createdBy: 1 });
ExamSectionSchema.index({ status: 1 });
ExamSectionSchema.index({ 'questions.questionId': 1 });

// Pre-save middleware to update question usage statistics
QuestionBankSchema.pre('save', function (next) {
    if (this.isNew) {
        this.isLatestVersion = true;
    }
    next();
});

// Virtual for success rate
QuestionBankSchema.virtual('successRate').get(function () {
    if (this.totalAttempts === 0) return 0;
    return (this.correctAttempts / this.totalAttempts) * 100;
});