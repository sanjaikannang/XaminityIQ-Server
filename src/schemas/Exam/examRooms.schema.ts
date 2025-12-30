import { Document, Types } from 'mongoose';
import { ExamRoomStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamRoomDocument = ExamRoom & Document;

@Schema({ timestamps: true })
export class ExamRoom {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
  examId: Types.ObjectId;

  @Prop({ required: true })
  hmsRoomId: string; // 100ms Room ID

  @Prop({ required: true })
  hmsRoomName: string; // 100ms Room Name

  @Prop({ required: true, default: 20 })
  maxStudents: number; // Maximum 20 students per room

  @Prop({ required: true, default: 0 })
  currentStudents: number; // Current number of students in the room

  @Prop({ 
    required: true, 
    enum: Object.values(ExamRoomStatus), 
    default: ExamRoomStatus.ACTIVE 
  })
  status: ExamRoomStatus;

  @Prop()
  facultyJoinedAt: Date; // Timestamp when faculty joined the room

  @Prop({ default: true })
  isActive: boolean;
}

export const ExamRoomSchema = SchemaFactory.createForClass(ExamRoom);

// Indexes
ExamRoomSchema.index({ examId: 1 });
ExamRoomSchema.index({ hmsRoomId: 1 });
ExamRoomSchema.index({ status: 1 });