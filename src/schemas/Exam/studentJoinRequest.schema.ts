import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JoinRequestStatus } from 'src/utils/enum';

export type StudentJoinRequestDocument = StudentJoinRequest & Document<Types.ObjectId>;

@Schema({ timestamps: true })
export class StudentJoinRequest {
    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ExamRoom', required: true })
    examRoomId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    facultyId: Types.ObjectId;

    @Prop({
        required: true,
        enum: Object.values(JoinRequestStatus),
        default: JoinRequestStatus.PENDING
    })
    status: JoinRequestStatus;

    @Prop({ required: true, default: false })
    isRejoin: boolean;

    @Prop()
    approvedAt: Date;

    @Prop()
    rejectedAt: Date;

    @Prop({ type: Types.ObjectId, ref: 'Faculty' })
    reviewedBy: Types.ObjectId;

    @Prop()
    rejectionReason: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const StudentJoinRequestSchema = SchemaFactory.createForClass(StudentJoinRequest);

// Indexes
StudentJoinRequestSchema.index({ examId: 1, studentId: 1, status: 1 });
StudentJoinRequestSchema.index({ examRoomId: 1, status: 1 });
StudentJoinRequestSchema.index({ facultyId: 1, status: 1 });