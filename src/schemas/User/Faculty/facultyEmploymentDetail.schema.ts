import { Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type FacultyEmploymentDetailDocument = FacultyEmploymentDetail & Document;

@Schema({ timestamps: true })
export class FacultyEmploymentDetail {
    @Prop({ required: true, unique: true })
    employeeId: string; // Auto or Manual generated

    @Prop({ required: true, enum: ['ASSISTANT_PROFESSOR', 'ASSOCIATE_PROFESSOR', 'PROFESSOR', 'LECTURER', 'HOD', 'PRINCIPAL'] })
    designation: string;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ required: true, enum: ['PERMANENT', 'CONTRACT', 'VISITING', 'GUEST', 'ADJUNCT'] })
    employmentType: string;

    @Prop({ required: true })
    dateOfJoining: Date;

    @Prop()
    dateOfLeaving: Date;

    @Prop({ required: true, default: 0 })
    totalExperienceYears: number; // Total experience including previous work

    @Prop({ required: true, enum: ['PhD', 'MTECH', 'ME', 'MBA', 'MSC', 'BE', 'BTECH', 'OTHER'] })
    highestQualification: string;

    @Prop({ default: 'ACTIVE' }) // ACTIVE | ON_LEAVE | RESIGNED | RETIRED | TERMINATED
    status: string;

    @Prop()
    basicSalary: number;

    @Prop()
    remarks: string;
}

export const FacultyEmploymentDetailSchema = SchemaFactory.createForClass(FacultyEmploymentDetail);

// Indexes
FacultyEmploymentDetailSchema.index({ employeeId: 1 });
FacultyEmploymentDetailSchema.index({ departmentId: 1 });
FacultyEmploymentDetailSchema.index({ designation: 1, status: 1 });