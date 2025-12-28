import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FacultyDocument = Faculty & Document;

@Schema({ timestamps: true })
export class Faculty {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    facultyId: string;

    @Prop({ type: Types.ObjectId, ref: 'FacultyPersonalDetail', required: true })
    personalDetailId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'FacultyContactInformation', required: true })
    contactInformationId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'FacultyAddressDetail', required: true })
    addressDetailId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'FacultyEducationHistory' }], default: [] })
    educationHistoryIds: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'FacultyEmploymentDetail', required: true })
    employmentDetailId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'FacultyWorkExperience' }], default: [] })
    workExperienceIds: Types.ObjectId[];

    @Prop({ default: true })
    isActive: boolean;
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);

// Indexes
FacultySchema.index({ facultyId: 1 });
FacultySchema.index({ userId: 1 });
FacultySchema.index({ employmentDetailId: 1 });