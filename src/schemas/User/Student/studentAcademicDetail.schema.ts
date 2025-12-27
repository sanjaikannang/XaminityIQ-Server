import { Document, Types } from "mongoose";
import { AdmissionType, StudentStatus } from "src/utils/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type StudentAcademicDetailDocument = StudentAcademicDetail & Document;

@Schema({ timestamps: true })
export class StudentAcademicDetail {
    @Prop({ required: true, unique: true })
    rollNumber: string;

    @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
    batchId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
    sectionId: Types.ObjectId;

    @Prop({ required: true, default: 1 })
    currentSemester: number;

    @Prop({ required: true, enum: Object.values(AdmissionType) })
    admissionType: AdmissionType;

    @Prop({ required: true, enum: Object.values(StudentStatus) })
    status: string;
}

export const StudentAcademicDetailSchema = SchemaFactory.createForClass(StudentAcademicDetail);

StudentAcademicDetailSchema.index({ admissionNumber: 1 });
StudentAcademicDetailSchema.index({ rollNumber: 1 });
StudentAcademicDetailSchema.index({ batchId: 1, courseId: 1, departmentId: 1 });
StudentAcademicDetailSchema.index({ sectionId: 1 });