import { Document, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { EmploymentType, FacultyDesignation, FacultyStatus, HighestQualification } from "src/utils/enum";

export type FacultyEmploymentDetailDocument = FacultyEmploymentDetail & Document;

@Schema({ timestamps: true })
export class FacultyEmploymentDetail {
    @Prop({ required: true, unique: true })
    employeeId: string;

    @Prop({ required: true, enum: Object.values(FacultyDesignation) })
    designation: string;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(EmploymentType) })
    employmentType: string;

    @Prop({ required: true })
    dateOfJoining: Date;

    @Prop()
    dateOfLeaving: Date;

    @Prop({ required: true, default: 0 })
    totalExperienceYears: number;

    @Prop({ required: true, enum: Object.values(HighestQualification) })
    highestQualification: string;

    @Prop({ required: true, enum: Object.values(FacultyStatus) })
    status: string;

    @Prop()
    remarks: string;
}

export const FacultyEmploymentDetailSchema = SchemaFactory.createForClass(FacultyEmploymentDetail);

FacultyEmploymentDetailSchema.index({ employeeId: 1 });
FacultyEmploymentDetailSchema.index({ departmentId: 1 });
FacultyEmploymentDetailSchema.index({ designation: 1, status: 1 });