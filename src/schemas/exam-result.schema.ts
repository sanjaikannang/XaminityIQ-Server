import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type ExamResultDocument = ExamResult & Document;

@Schema({ timestamps: true })
export class ExamResult {

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ExamSession', required: true })
    sessionId: Types.ObjectId;

    @Prop({ type: Number, required: true, default: 0 })
    totalMarks: number;

    @Prop({ type: Number, required: true, default: 0 })
    marksObtained: number;

    @Prop({ type: Number, required: true, default: 0 })
    percentage: number;

    @Prop({ type: String, required: true })
    grade: string;

    @Prop({ type: Boolean, required: true, default: false })
    isPassed: boolean;

    @Prop({
        type: {
            totalQuestions: { type: Number, required: true },
            questionsAttempted: { type: Number, required: true },
            correctAnswers: { type: Number, required: true },
            wrongAnswers: { type: Number, required: true },
            unanswered: { type: Number, required: true },
        }
    })
    summary: {
        totalQuestions: number;
        questionsAttempted: number;
        correctAnswers: number;
        wrongAnswers: number;
        unanswered: number;
    };

    @Prop({
        type: [{
            questionId: { type: Types.ObjectId, ref: 'Question' },
            marksAllocated: { type: Number },
            marksObtained: { type: Number },
            isCorrect: { type: Boolean },
            timeSpent: { type: Number },
        }]
    })
    questionWiseResult: Array<{
        questionId: Types.ObjectId;
        marksAllocated: number;
        marksObtained: number;
        isCorrect: boolean;
        timeSpent: number;
    }>;

    @Prop({ type: Number, required: true })
    rank: number;

    @Prop({ type: Number, required: true })
    totalTimeSpent: number; // in seconds

    @Prop({ type: Boolean, default: false })
    isPublished: boolean;

    @Prop({ type: Date })
    publishedAt: Date;

    @Prop({ type: String })
    feedback: string;

    @Prop({ type: String })
    certificate: string; // URL to certificate if passed

}

export const ExamResultSchema = SchemaFactory.createForClass(ExamResult);

// Indexes
ExamResultSchema.index({ examId: 1, studentId: 1 });
ExamResultSchema.index({ examId: 1, rank: 1 });
ExamResultSchema.index({ studentId: 1 });
ExamResultSchema.index({ isPublished: 1 });