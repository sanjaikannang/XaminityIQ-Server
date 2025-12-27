import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    studentId: string;

    @Prop({ type: Types.ObjectId, ref: 'StudentPersonalDetail', required: true })
    personalDetailId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'StudentContactInformation', required: true })
    contactInformationId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'StudentAddressDetail', required: true })
    addressDetailId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'StudentAcademicDetail', required: true })
    academicDetailId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'StudentEducationHistory', required: false })
    educationHistoryId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'StudentParentDetail', required: false })
    parentDetailId?: Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

// Indexes
StudentSchema.index({ studentId: 1 });
StudentSchema.index({ userId: 1 });
StudentSchema.index({ academicDetailId: 1 });