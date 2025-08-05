import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
    ExamAttemptStatus,
    QuestionAttemptStatus,
    ProctoringViolationType
} from 'src/utils/enum';

export type ExamAttemptDocument = ExamAttempt & Document;

// Answer submission schema
@Schema({ _id: false })
export class AnswerSubmission {
    @Prop({ required: true })
    answer: string; // JSON string or plain text based on question type

    @Prop()
    selectedOptions?: string[]; // For MCQ/Multiple Select - option IDs or texts

    @Prop({ default: Date.now })
    submittedAt: Date;

    @Prop({ default: 1 })
    attemptCount: number; // How many times student changed this answer

    @Prop()
    timeSpent?: number; // Time spent on this question in seconds

    @Prop({ default: false })
    isMarkedForReview: boolean;

    @Prop()
    attachments?: string[]; // For file upload questions
}

// Question attempt details
@Schema({ _id: false })
export class QuestionAttempt {
    @Prop({ type: Types.ObjectId, ref: 'QuestionBank', required: true })
    questionId: Types.ObjectId;

    @Prop({ required: true })
    sectionId: string; // Section identifier within the exam

    @Prop({ required: true })
    questionOrder: number;

    @Prop({ type: AnswerSubmission })
    submission?: AnswerSubmission;

    @Prop({ enum: QuestionAttemptStatus, default: QuestionAttemptStatus.NOT_ATTEMPTED })
    status: QuestionAttemptStatus;

    @Prop()
    marksObtained?: number;

    @Prop()
    isCorrect?: boolean;

    @Prop({ default: false })
    isPartiallyCorrect?: boolean;

    @Prop()
    evaluatedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    evaluatedBy?: Types.ObjectId;

    @Prop()
    evaluatorComments?: string;

    @Prop()
    timeSpent?: number; // Total time spent on this question in seconds

    @Prop()
    firstViewedAt?: Date;

    @Prop()
    lastModifiedAt?: Date;

    // Auto-proctoring data per question
    @Prop({
        type: [{
            violationType: { type: String, enum: ProctoringViolationType },
            timestamp: { type: Date, default: Date.now },
            severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            description: { type: String },
            evidence: { type: String } // URL to screenshot/recording
        }]
    })
    proctoringViolations?: Array<{
        violationType: ProctoringViolationType;
        timestamp: Date;
        severity: string;
        description?: string;
        evidence?: string;
    }>;
}

// Proctoring session data
@Schema({ _id: false })
export class ProctoringSession {
    @Prop({ default: Date.now })
    sessionStartTime: Date;

    @Prop()
    sessionEndTime?: Date;

    @Prop({ default: 0 })
    tabSwitchCount: number;

    @Prop({ default: 0 })
    windowBlurCount: number;

    @Prop({ default: 0 })
    fullscreenExitCount: number;

    @Prop()
    faceDetectionFailures?: number;

    @Prop({ type: [String] })
    screenRecordings?: string[]; // URLs to recorded segments

    @Prop({ type: [String] })
    screenshots?: string[]; // URLs to captured screenshots

    @Prop({
        type: [{
            violationType: { type: String, enum: ProctoringViolationType },
            timestamp: { type: Date, default: Date.now },
            severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            description: { type: String },
            evidence: { type: String },
            autoDetected: { type: Boolean, default: true }
        }]
    })
    violations: Array<{
        violationType: ProctoringViolationType;
        timestamp: Date;
        severity: string;
        description?: string;
        evidence?: string;
        autoDetected: boolean;
    }>;

    @Prop()
    overallRiskScore?: number; // 0-100 based on violations

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    monitoredBy?: Types.ObjectId; // For live proctoring

    @Prop()
    monitoringNotes?: string;
}

// Browser and device information
@Schema({ _id: false })
export class DeviceInfo {
    @Prop()
    userAgent?: string;

    @Prop()
    browserName?: string;

    @Prop()
    browserVersion?: string;

    @Prop()
    operatingSystem?: string;

    @Prop()
    deviceType?: string; // desktop, mobile, tablet

    @Prop()
    screenResolution?: string;

    @Prop()
    ipAddress?: string;

    @Prop()
    location?: {
        country?: string;
        state?: string;
        city?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };

    @Prop()
    timezone?: string;
}

// Main Exam Attempt Schema
@Schema({ timestamps: true })
export class ExamAttempt {
    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ required: true })
    studentRollNumber: string; // Denormalized for quick access

    @Prop({ required: true, default: 1 })
    attemptNumber: number; // In case retakes are allowed

    @Prop({ enum: ExamAttemptStatus, default: ExamAttemptStatus.NOT_STARTED })
    status: ExamAttemptStatus;

    // Timing information
    @Prop()
    startedAt?: Date;

    @Prop()
    submittedAt?: Date;

    @Prop()
    lastActiveAt?: Date; // For detecting inactive sessions

    @Prop()
    timeRemaining?: number; // Remaining time in seconds

    @Prop()
    totalTimeSpent?: number; // Total time spent in seconds

    @Prop({ default: false })
    isAutoSubmitted: boolean; // True if submitted due to time expiry

    // Question attempts
    @Prop({ type: [QuestionAttempt], default: [] })
    questionAttempts: QuestionAttempt[];

    // Scores and evaluation
    @Prop()
    totalMarksObtained?: number;

    @Prop()
    totalMaxMarks?: number;

    @Prop()
    percentage?: number;

    @Prop()
    grade?: string;

    @Prop({ default: false })
    isPassed?: boolean;

    @Prop()
    rank?: number; // Student's rank in this exam

    // Evaluation status
    @Prop({ default: false })
    isEvaluated: boolean;

    @Prop()
    evaluatedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    evaluatedBy?: Types.ObjectId;

    @Prop({ default: false })
    requiresManualEvaluation: boolean;

    // Section-wise performance
    @Prop({
        type: [{
            sectionId: { type: String, required: true },
            sectionName: { type: String, required: true },
            marksObtained: { type: Number, default: 0 },
            maxMarks: { type: Number, required: true },
            questionsAttempted: { type: Number, default: 0 },
            totalQuestions: { type: Number, required: true },
            timeSpent: { type: Number, default: 0 } // in seconds
        }]
    })
    sectionPerformance?: Array<{
        sectionId: string;
        sectionName: string;
        marksObtained: number;
        maxMarks: number;
        questionsAttempted: number;
        totalQuestions: number;
        timeSpent: number;
    }>;

    // Proctoring data
    @Prop({ type: ProctoringSession })
    proctoringSession?: ProctoringSession;

    // Device and browser information
    @Prop({ type: DeviceInfo })
    deviceInfo?: DeviceInfo;

    // Exam session management
    @Prop()
    sessionId?: string; // Unique session identifier

    @Prop({ default: false })
    isResumed: boolean; // True if exam was resumed after interruption

    @Prop()
    previousAttemptIds?: Types.ObjectId[]; // For retake tracking

    // Flag for suspected malpractice
    @Prop({ default: false })
    isFlagged: boolean;

    @Prop()
    flaggedReason?: string;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    flaggedBy?: Types.ObjectId;

    @Prop()
    flaggedAt?: Date;

    // Additional metadata
    @Prop({ type: Map, of: String })
    metadata?: Map<string, string>; // For storing additional custom data

    // Exam configuration snapshot (to handle config changes)
    @Prop()
    examConfigSnapshot?: {
        totalMarks: number;
        duration: number;
        passingMarks: number;
        randomizationLevel: string;
    };
}

export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);

// Indexes for better performance
ExamAttemptSchema.index({ examId: 1 });
ExamAttemptSchema.index({ studentId: 1 });
ExamAttemptSchema.index({ studentRollNumber: 1 });
ExamAttemptSchema.index({ status: 1 });
ExamAttemptSchema.index({ startedAt: 1 });
ExamAttemptSchema.index({ submittedAt: 1 });
ExamAttemptSchema.index({ isEvaluated: 1 });
ExamAttemptSchema.index({ isFlagged: 1 });
ExamAttemptSchema.index({ sessionId: 1 });

// Compound indexes
ExamAttemptSchema.index({ examId: 1, studentId: 1 });
ExamAttemptSchema.index({ examId: 1, status: 1 });
ExamAttemptSchema.index({ examId: 1, submittedAt: -1 });
ExamAttemptSchema.index({ studentId: 1, status: 1 });
ExamAttemptSchema.index({ examId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });