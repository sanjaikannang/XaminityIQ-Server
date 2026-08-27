import { Document, Types } from 'mongoose';
import { RoomAssignmentStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamRoomAssignmentDocument = ExamRoomAssignment & Document;

@Schema({ collection: 'exam_room_assigment', timestamps: true })
export class ExamRoomAssignment {

    @Prop({ type: Types.ObjectId, ref: 'ExamRoom', required: true })
    roomId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    // Set on admission
    @Prop({ type: Types.ObjectId, ref: 'ExamAttempt' })
    attemptId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(RoomAssignmentStatus), default: RoomAssignmentStatus.WAITING })
    status: string;

    @Prop()
    enteredWaitingRoomAt: Date;

    @Prop()
    admittedAt: Date;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    admittedBy: Types.ObjectId;

    @Prop()
    removedAt: Date;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    removedBy: Types.ObjectId;

    @Prop()
    removalReason: string;

    // Set when a LiveKit `participant_left` webhook fires for this student
    // while ADMITTED/IN_PROGRESS; cleared on reconnect (`participant_joined`).
    // A scheduled sweep (see LiveKitDisconnectSweepService) flips the status
    // to DISCONNECTED once this exceeds the exam's connectionLossGracePeriodMinutes.
    @Prop()
    disconnectedAt: Date;

}

export const ExamRoomAssignmentSchema = SchemaFactory.createForClass(ExamRoomAssignment);

ExamRoomAssignmentSchema.index({ roomId: 1, studentId: 1 }, { unique: true });
ExamRoomAssignmentSchema.index({ roomId: 1, status: 1 });
ExamRoomAssignmentSchema.index({ examId: 1, studentId: 1 });
