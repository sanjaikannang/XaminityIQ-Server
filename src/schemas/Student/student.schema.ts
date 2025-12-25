import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    studentId: string; // Auto-generated UUID

    @Prop({ type: Types.ObjectId, ref: 'PersonalDetail', required: true })
    personalDetailId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ContactInformation', required: true })
    contactInformationId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'AddressDetail', required: true })
    addressDetailId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'AcademicDetail', required: true })
    academicDetailId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ParentDetail' })
    parentDetailId: Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

// Indexes
StudentSchema.index({ studentId: 1 });
StudentSchema.index({ userId: 1 });
StudentSchema.index({ academicDetailId: 1 });