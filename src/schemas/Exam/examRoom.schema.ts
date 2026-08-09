import { Document, Types } from 'mongoose';
import { ExamRoomStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamRoomDocument = ExamRoom & Document;

@Schema({ collection: 'exam_rooms', timestamps: true })
export class ExamRoom {

    // Set only when every assignment in this room belongs to the same exam.
    // Left unset for a pooled room mixing leftover students from multiple
    // exams sharing an identical PROCTORING window (Dynamic Room Allocation) —
    // ExamRoomAssignment.examId is the authoritative per-student exam reference.
    @Prop({ type: Types.ObjectId, ref: 'Exam' })
    examId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    facultyId: Types.ObjectId;

    @Prop({ required: true })
    startDateTime: Date;

    @Prop({ required: true })
    endDateTime: Date;

    @Prop({ required: true })
    durationMinutes: number;

    @Prop({ required: true, unique: true })
    liveKitSessionId: string;

    @Prop({ required: true, enum: Object.values(ExamRoomStatus), default: ExamRoomStatus.SCHEDULED })
    status: string;

}

export const ExamRoomSchema = SchemaFactory.createForClass(ExamRoom);

ExamRoomSchema.index({ facultyId: 1, startDateTime: 1 });
ExamRoomSchema.index({ startDateTime: 1, endDateTime: 1 });
ExamRoomSchema.index({ examId: 1 });
