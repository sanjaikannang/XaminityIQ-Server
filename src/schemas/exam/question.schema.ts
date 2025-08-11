import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { DifficultyLevel, QuestionType, Status } from "src/utils/enum";

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
    @Prop({ required: true, unique: true })
    questionId: string; // QUE001, QUE002

    @Prop({ type: Types.ObjectId, ref: 'ExamSection', required: true })
    examSectionId: Types.ObjectId;

    @Prop({ required: true })
    questionText: string;

    @Prop({ type: String })
    questionImage?: string; // URL to image if any

    @Prop({ required: true, enum: QuestionType })
    questionType: QuestionType;

    @Prop({ required: true, min: 0 })
    marks: number;

    @Prop({ required: true })
    questionOrder: number; // Order within the section

    @Prop({ enum: DifficultyLevel, default: DifficultyLevel.MEDIUM })
    difficultyLevel: DifficultyLevel;

    // For MCQ questions
    @Prop({
        type: [{
            optionText: { type: String, required: true },
            optionImage: { type: String }, // Optional image for option
            isCorrect: { type: Boolean, default: false }
        }],
        default: []
    })
    options: Array<{
        optionText: string;
        optionImage?: string;
        isCorrect: boolean;
    }>;

    // For Short/Long answer questions
    @Prop({
        type: [{
            answerText: { type: String, required: true },
            keywords: [{ type: String }], // Keywords for auto-evaluation
            marks: { type: Number, required: true }
        }],
        default: []
    })
    correctAnswers: Array<{
        answerText: string;
        keywords: string[];
        marks: number;
    }>;

    // For True/False questions
    @Prop({ type: Boolean })
    correctAnswer?: boolean;

    @Prop({ type: String })
    explanation?: string; // Explanation for the correct answer

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Indexes
QuestionSchema.index({ questionId: 1 });
QuestionSchema.index({ examSectionId: 1 });
QuestionSchema.index({ questionType: 1 });
QuestionSchema.index({ difficultyLevel: 1 });
QuestionSchema.index({ examSectionId: 1, questionOrder: 1 });
QuestionSchema.index({ status: 1 });