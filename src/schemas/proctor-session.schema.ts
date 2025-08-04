import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type ProctorSessionDocument = ProctorSession & Document;

@Schema({ timestamps: true })
export class ProctorSession {

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    proctorId: Types.ObjectId;

    @Prop({ type: String, required: true })
    channelName: string;

    @Prop({ type: Number, required: true })
    uid: number;

    @Prop({ type: String })
    token: string;

    @Prop([{ type: Types.ObjectId, ref: 'Student' }])
    assignedStudents: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'ExamSession' }])
    activeSessions: Types.ObjectId[];

    @Prop({ type: Date })
    startTime: Date;

    @Prop({ type: Date })
    endTime: Date;

    @Prop({
        type: [{
            studentId: { type: Types.ObjectId, ref: 'Student' },
            action: { type: String }, // WARNED, TERMINATED, CHAT_SENT, etc.
            timestamp: { type: Date },
            message: { type: String },
            severity: { type: String },
        }]
    })
    actions: Array<{
        studentId: Types.ObjectId;
        action: string;
        timestamp: Date;
        message: string;
        severity: string;
    }>;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

}

export const ProctorSessionSchema = SchemaFactory.createForClass(ProctorSession);

// Indexes
ProctorSessionSchema.index({ examId: 1, proctorId: 1 });
ProctorSessionSchema.index({ proctorId: 1, isActive: 1 });
ProctorSessionSchema.index({ channelName: 1 });