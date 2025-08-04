import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type StudentAnswerDocument = StudentAnswer & Document;

@Schema({ timestamps: true })
export class StudentAnswer {

    @Prop({ type: Types.ObjectId, ref: 'ExamSession', required: true })
    sessionId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
    questionId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    // For MCQ/Single Choice
    @Prop([{ type: String }])
    selectedOptions: string[];

    // For Fill in the blanks
    @Prop({
        type: [{
            blankId: { type: String },
            answer: { type: String },
        }]
    })
    blankAnswers: Array<{
        blankId: string;
        answer: string;
    }>;

    // For Essay
    @Prop({ type: String })
    essayAnswer: string;

    // For Coding
    @Prop({
        type: {
            code: { type: String },
            language: { type: String },
            testResults: [{
                testCaseId: { type: String },
                passed: { type: Boolean },
                executionTime: { type: Number },
                memoryUsed: { type: Number },
                output: { type: String },
                error: { type: String },
            }],
        }
    })
    codingAnswer: {
        code?: string;
        language?: string;
        testResults: Array<{
            testCaseId: string;
            passed: boolean;
            executionTime: number;
            memoryUsed: number;
            output: string;
            error?: string;
        }>;
    };

    @Prop({ type: Boolean, default: false })
    isAnswered: boolean;

    @Prop({ type: Boolean, default: false })
    isReviewed: boolean;

    @Prop({ type: Number, default: 0 })
    marksAwarded: number;

    @Prop({ type: Boolean, default: false })
    isGraded: boolean;

    @Prop({ type: String })
    feedback: string;

    @Prop({ type: Date })
    answeredAt: Date;

    @Prop({ type: Number, default: 0 })
    timeSpent: number; // in seconds

    @Prop({ type: Number, default: 0 })
    attemptCount: number;

}

export const StudentAnswerSchema = SchemaFactory.createForClass(StudentAnswer);

// Indexes
StudentAnswerSchema.index({ sessionId: 1, questionId: 1 });
StudentAnswerSchema.index({ studentId: 1 });
StudentAnswerSchema.index({ isGraded: 1 });