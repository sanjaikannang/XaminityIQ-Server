import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EnrollmentStatus } from 'src/utils/enum';

export type StudentEnrollmentDocument = StudentEnrollment & Document;

@Schema({ timestamps: true })
export class StudentEnrollment {

    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({
        type: String,
        enum: Object.values(EnrollmentStatus),
        default: EnrollmentStatus.ENROLLED,
    })
    status: EnrollmentStatus;

    @Prop({ default: false })
    hasJoined: boolean;

    @Prop()
    joinedAt?: Date;

    @Prop()
    leftAt?: Date;
}

export const StudentEnrollmentSchema =
    SchemaFactory.createForClass(StudentEnrollment);

// Indexes
StudentEnrollmentSchema.index({ examId: 1, studentId: 1 }, { unique: true });
StudentEnrollmentSchema.index({ studentId: 1 });
StudentEnrollmentSchema.index({ hasJoined: 1 });
