import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type ExamSessionDocument = ExamSession & Document;

@Schema({ timestamps: true })
export class ExamSession {

    @Prop({ type: String, required: true, unique: true })
    sessionId: string;

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    proctorId: Types.ObjectId;

    @Prop({ type: Date, required: true })
    startTime: Date;

    @Prop({ type: Date })
    endTime: Date;

    @Prop({ type: Date })
    submittedAt: Date;

    @Prop({ type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'TERMINATED', 'EXPIRED'], default: 'NOT_STARTED' })
    status: string;

    @Prop({
        type: {
            currentQuestionIndex: { type: Number, default: 0 },
            questionsAttempted: { type: Number, default: 0 },
            questionsAnswered: { type: Number, default: 0 },
            timeSpent: { type: Number, default: 0 }, // in seconds
            remainingTime: { type: Number },
        }
    })
    progress: {
        currentQuestionIndex: number;
        questionsAttempted: number;
        questionsAnswered: number;
        timeSpent: number;
        remainingTime?: number;
    };

    // Agora session details
    @Prop({
        type: {
            channelName: { type: String },
            uid: { type: Number },
            token: { type: String },
            recordingId: { type: String },
            screenShareUid: { type: Number },
        }
    })
    agoraSession: {
        channelName?: string;
        uid?: number;
        token?: string;
        recordingId?: string;
        screenShareUid?: number;
    };

    // Security monitoring
    @Prop({
        type: {
            violations: [{
                type: { type: String }, // TAB_SWITCH, CAMERA_OFF, MIC_OFF, etc.
                timestamp: { type: Date },
                severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                description: { type: String },
                resolved: { type: Boolean, default: false },
            }],
            totalViolations: { type: Number, default: 0 },
            warningsIssued: { type: Number, default: 0 },
            terminated: { type: Boolean, default: false },
            terminationReason: { type: String },
        }
    })
    monitoring: {
        violations: Array<{
            type: string;
            timestamp: Date;
            severity: string;
            description: string;
            resolved: boolean;
        }>;
        totalViolations: number;
        warningsIssued: number;
        terminated: boolean;
        terminationReason?: string;
    };

    @Prop({
        type: {
            browserInfo: { type: String },
            deviceInfo: { type: String },
            ipAddress: { type: String },
            location: { type: String },
            connectionQuality: { type: String },
        }
    })
    systemInfo: {
        browserInfo?: string;
        deviceInfo?: string;
        ipAddress?: string;
        location?: string;
        connectionQuality?: string;
    };

}

export const ExamSessionSchema = SchemaFactory.createForClass(ExamSession);

// Indexes
ExamSessionSchema.index({ sessionId: 1 });
ExamSessionSchema.index({ examId: 1, studentId: 1 });
ExamSessionSchema.index({ proctorId: 1 });
ExamSessionSchema.index({ status: 1 });
ExamSessionSchema.index({ startTime: 1 });