import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BatchDepartmentDocument = BatchDepartment & Document;

@Schema({ timestamps: true })
export class BatchDepartment {

    @Prop({ type: Types.ObjectId, ref: 'BatchCourse', required: true })
    batchCourseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    deptId: Types.ObjectId;

    @Prop({ required: true })
    totalSeats: number;

    @Prop({ default: 50 })
    sectionCapacity: number;

}

export const BatchDepartmentSchema = SchemaFactory.createForClass(BatchDepartment);