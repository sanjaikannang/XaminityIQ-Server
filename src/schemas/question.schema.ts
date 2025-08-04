import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { DifficultyLevel, QuestionType } from "src/utils/enum";

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {

    @Prop({ type: String, required: true, unique: true }) // e.g., QST001
    questionId: string;

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: String, enum: QuestionType, required: true })
    type: QuestionType; // MULTIPLE_CHOICE, SINGLE_CHOICE, TRUE_FALSE, FILL_BLANK, ESSAY, CODING

    @Prop({ type: String, required: true })
    question: string;

    @Prop({ type: String })
    questionImage: string;

    @Prop({ type: String })
    explanation: string;

    @Prop({ type: Number, required: true, min: 1 })
    marks: number;

    @Prop({ type: String, enum: DifficultyLevel, default: DifficultyLevel.MEDIUM })
    difficulty: DifficultyLevel;

    @Prop({ type: Number, required: true })
    orderIndex: number;

    // For MCQ, Single Choice, True/False
    @Prop({
        type: [{
            optionId: { type: String, required: true },
            text: { type: String, required: true },
            image: { type: String },
            isCorrect: { type: Boolean, default: false },
        }]
    })
    options: Array<{
        optionId: string;
        text: string;
        image?: string;
        isCorrect: boolean;
    }>;

    // For Fill in the blanks
    @Prop({
        type: [{
            blankId: { type: String },
            correctAnswers: [{ type: String }],
            caseSensitive: { type: Boolean, default: false },
            acceptPartialCredit: { type: Boolean, default: false },
        }]
    })
    blanks: Array<{
        blankId: string;
        correctAnswers: string[];
        caseSensitive: boolean;
        acceptPartialCredit: boolean;
    }>;

    // For Essay questions
    @Prop({
        type: {
            maxWords: { type: Number },
            minWords: { type: Number },
            keywords: [{ type: String }],
            rubric: { type: String },
        }
    })
    essaySettings: {
        maxWords?: number;
        minWords?: number;
        keywords: string[];
        rubric?: string;
    };

    // For Coding questions
    @Prop({
        type: {
            language: { type: String },
            starterCode: { type: String },
            testCases: [{
                input: { type: String },
                expectedOutput: { type: String },
                isHidden: { type: Boolean, default: false },
                points: { type: Number, default: 1 },
            }],
            timeLimit: { type: Number }, // in seconds
            memoryLimit: { type: Number }, // in MB
        }
    })
    codingSettings: {
        language?: string;
        starterCode?: string;
        testCases: Array<{
            input: string;
            expectedOutput: string;
            isHidden: boolean;
            points: number;
        }>;
        timeLimit?: number;
        memoryLimit?: number;
    };

    @Prop({
        type: {
            category: { type: String },
            tags: [{ type: String }],
            bloomsLevel: { type: String }, // Remember, Understand, Apply, Analyze, Evaluate, Create
            learningOutcome: { type: String },
        }
    })
    metadata: {
        category?: string;
        tags: string[];
        bloomsLevel?: string;
        learningOutcome?: string;
    };

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Indexes
QuestionSchema.index({ questionId: 1 });
QuestionSchema.index({ examId: 1, orderIndex: 1 });
QuestionSchema.index({ type: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ isActive: 1 });