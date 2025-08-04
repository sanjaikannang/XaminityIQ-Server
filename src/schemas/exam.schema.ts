import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ExamMode, ExamStatus } from 'src/utils/enum';

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {

    @Prop({ type: String, required: true, unique: true }) // e.g., EXM001
    examId: string;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String })
    description: string;

    @Prop({ type: String, required: true })
    subject: string;

    @Prop({ type: String, required: true })
    course: string;

    @Prop({ type: String, required: true })
    branch: string;

    @Prop({ type: Number, required: true })
    semester: number;

    @Prop({ type: String })
    section: string;

    @Prop({ type: String, required: true })
    batch: string;

    @Prop({ type: String, enum: ExamMode, required: true })
    mode: ExamMode; // AUTO or PROCTORED

    @Prop({
        type: {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            duration: { type: Number, required: true }, // in minutes
            timeZone: { type: String, default: 'Asia/Kolkata' }          
        },
        required: true
    })
    schedule: {
        startDate: Date;
        endDate: Date;
        duration: number;
        timeZone: string;
        allowLateSubmission: boolean;
        lateSubmissionPenalty: number;
    };

    @Prop({
        type: {
            totalMarks: { type: Number, required: true },
            passingMarks: { type: Number, required: true },
            negativeMarking: { type: Boolean, default: false },
            negativeMarkingValue: { type: Number, default: 0 }, // per wrong answer
            showResultImmediately: { type: Boolean, default: false },
            showCorrectAnswers: { type: Boolean, default: false },
            resultPublishDate: { type: Date },
        },
        required: true
    })
    grading: {
        totalMarks: number;
        passingMarks: number;
        negativeMarking: boolean;
        negativeMarkingValue: number;
        showResultImmediately: boolean;
        showCorrectAnswers: boolean;
        resultPublishDate?: Date;
    };

    @Prop({
        type: {
            randomizeQuestions: { type: Boolean, default: false },
            randomizeOptions: { type: Boolean, default: false },
            questionsPerPage: { type: Number, default: 1 },
            allowQuestionReview: { type: Boolean, default: true },
            allowQuestionSkip: { type: Boolean, default: true },
            showQuestionNumbers: { type: Boolean, default: true },
            preventCopyPaste: { type: Boolean, default: true },
            disableRightClick: { type: Boolean, default: true },
        }
    })
    settings: {
        randomizeQuestions: boolean;
        randomizeOptions: boolean;
        questionsPerPage: number;
        allowQuestionReview: boolean;
        allowQuestionSkip: boolean;
        showQuestionNumbers: boolean;
        preventCopyPaste: boolean;
        disableRightClick: boolean;
    };

    // Proctoring specific settings
    @Prop({
        type: {
            faculty: [{ type: Types.ObjectId, ref: 'Faculty' }],
            maxStudentsPerProctor: { type: Number, default: 20 },
            autoAdmitStudents: { type: Boolean, default: false },
            recordSession: { type: Boolean, default: true },
            enableChat: { type: Boolean, default: false },
            allowProctorIntervention: { type: Boolean, default: true },
        }
    })
    proctoring: {
        faculty: Types.ObjectId[];
        maxStudentsPerProctor: number;
        autoAdmitStudents: boolean;
        recordSession: boolean;
        enableChat: boolean;
        allowProctorIntervention: boolean;
    };

    // Security and monitoring settings
    @Prop({
        type: {
            requireCameraAccess: { type: Boolean, default: true },
            requireMicrophoneAccess: { type: Boolean, default: true },
            requireScreenShare: { type: Boolean, default: true },
            detectTabSwitch: { type: Boolean, default: true },
            detectMultipleMonitors: { type: Boolean, default: true },
            lockdownBrowser: { type: Boolean, default: false },
            allowedApplications: [{ type: String }],
            blockedWebsites: [{ type: String }],
            maxViolations: { type: Number, default: 3 },
        }
    })
    security: {
        requireCameraAccess: boolean;
        requireMicrophoneAccess: boolean;
        requireScreenShare: boolean;
        detectTabSwitch: boolean;
        detectMultipleMonitors: boolean;
        lockdownBrowser: boolean;
        allowedApplications: string[];
        blockedWebsites: string[];
        maxViolations: number;
    };

    @Prop({
        type: {
            instructions: { type: String, required: true },
            technicalRequirements: [{ type: String }],
            examRules: [{ type: String }],
            contactInfo: {
                supportEmail: { type: String },
                supportPhone: { type: String },
                emergencyContact: { type: String },
            }
        }
    })
    instructions: {
        instructions: string;
        technicalRequirements: string[];
        examRules: string[];
        contactInfo: {
            supportEmail?: string;
            supportPhone?: string;
            emergencyContact?: string;
        };
    };

    @Prop({ type: String, enum: ExamStatus, default: ExamStatus.DRAFT })
    status: ExamStatus; // DRAFT, PUBLISHED, ACTIVE, COMPLETED, CANCELLED

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    publishedBy: Types.ObjectId;

    @Prop({ type: Date })
    publishedAt: Date;

    // Statistics
    @Prop({
        type: {
            totalStudents: { type: Number, default: 0 },
            studentsAppeared: { type: Number, default: 0 },
            studentsCompleted: { type: Number, default: 0 },
            averageScore: { type: Number, default: 0 },
            highestScore: { type: Number, default: 0 },
            lowestScore: { type: Number, default: 0 },
        }
    })
    statistics: {
        totalStudents: number;
        studentsAppeared: number;
        studentsCompleted: number;
        averageScore: number;
        highestScore: number;
        lowestScore: number;
    };

}

export const ExamSchema = SchemaFactory.createForClass(Exam);

// Indexes
ExamSchema.index({ examId: 1 });
ExamSchema.index({ course: 1, branch: 1, semester: 1 });
ExamSchema.index({ status: 1 });
ExamSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
ExamSchema.index({ mode: 1 });
ExamSchema.index({ createdBy: 1 });