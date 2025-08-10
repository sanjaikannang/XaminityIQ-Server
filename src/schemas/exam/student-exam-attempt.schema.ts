import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { AttemptStatus, Status } from "src/utils/enum";

export type StudentExamAttemptDocument = StudentExamAttempt & Document;

@Schema({ timestamps: true })
export class StudentExamAttempt {
    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ required: true, enum: AttemptStatus, default: AttemptStatus.NOT_STARTED })
    attemptStatus: AttemptStatus;

    @Prop({ type: Date })
    startTime?: Date;

    @Prop({ type: Date })
    endTime?: Date;

    @Prop({ type: Date })
    submittedAt?: Date;

    @Prop({ type: Number, default: 0 })
    totalMarksObtained: number;

    @Prop({ type: Number, default: 0 })
    totalTimeSpent: number; // in minutes

    @Prop({ type: Boolean, default: false })
    isPassed: boolean;

    @Prop({ type: String })
    remarks?: string;

    // Answers given by student
    @Prop({
        type: [{
            questionId: { type: Types.ObjectId, ref: 'Question', required: true },
            answer: { type: String }, // For MCQ: option index, For text: actual answer
            marksObtained: { type: Number, default: 0 },
            isCorrect: { type: Boolean, default: false },
            timeTaken: { type: Number, default: 0 }, // in seconds
            isReviewed: { type: Boolean, default: false } // For manual checking
        }],
        default: []
    })
    answers: Array<{
        questionId: Types.ObjectId;
        answer?: string;
        marksObtained: number;
        isCorrect: boolean;
        timeTaken: number;
        isReviewed: boolean;
    }>;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    evaluatedBy?: Types.ObjectId; // Faculty who evaluated

    @Prop({ type: Date })
    evaluatedAt?: Date;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const StudentExamAttemptSchema = SchemaFactory.createForClass(StudentExamAttempt);

// Indexes
StudentExamAttemptSchema.index({ studentId: 1 });
StudentExamAttemptSchema.index({ examId: 1 });
StudentExamAttemptSchema.index({ attemptStatus: 1 });
StudentExamAttemptSchema.index({ studentId: 1, examId: 1 }, { unique: true });
StudentExamAttemptSchema.index({ isPassed: 1 });
StudentExamAttemptSchema.index({ submittedAt: 1 });