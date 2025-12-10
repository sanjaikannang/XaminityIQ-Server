import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ required: true })
    deptCode: string;

    @Prop({ required: true })
    deptName: string;

}

export const DepartmentSchema = SchemaFactory.createForClass(Department);