import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ExamMode, ExamRoomStatus } from 'src/utils/enum';

export type ExamRoomDocument = ExamRoom & Document;

@Schema({ timestamps: true })
export class ExamRoom {

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, unique: true })
    examId: Types.ObjectId;

    @Prop({ required: true })
    hmsRoomId: string;

    @Prop({ required: true })
    hmsRoomName: string;

    @Prop({ required: true })
    maxStudents: number;

    @Prop({ default: 0 })
    currentStudents: number;

    @Prop({
        type: String,
        enum: Object.values(ExamRoomStatus),
        default: ExamRoomStatus.CREATED,
    })
    status: ExamRoomStatus;

    @Prop({
        type: String,
        enum: Object.values(ExamMode),
        required: true,
    })
    mode: ExamMode;

    @Prop()
    facultyJoinedAt?: Date;

    @Prop()
    roomEndedAt?: Date;
}

export const ExamRoomSchema = SchemaFactory.createForClass(ExamRoom);

// Indexes
ExamRoomSchema.index({ examId: 1 });
ExamRoomSchema.index({ hmsRoomId: 1 });
ExamRoomSchema.index({ status: 1 });
