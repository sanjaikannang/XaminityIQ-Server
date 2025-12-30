import { Document, Types } from 'mongoose';
import { EnrollmentStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StudentEnrollmentDocument = StudentEnrollment & Document<Types.ObjectId>;

@Schema({ timestamps: true })
export class StudentEnrollment {
    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ExamRoom', required: true })
    examRoomId: Types.ObjectId;

    @Prop({
        required: true,
        enum: Object.values(EnrollmentStatus),
        default: EnrollmentStatus.ENROLLED
    })
    status: EnrollmentStatus;

    @Prop({ required: true, default: Date.now })
    enrolledAt: Date;

    @Prop({ default: false })
    hasJoined: boolean;

    @Prop()
    joinedAt: Date;

    @Prop()
    leftAt: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const StudentEnrollmentSchema = SchemaFactory.createForClass(StudentEnrollment);

// Indexes
StudentEnrollmentSchema.index({ examId: 1, studentId: 1 }, { unique: true });
StudentEnrollmentSchema.index({ examRoomId: 1 });
StudentEnrollmentSchema.index({ status: 1 });