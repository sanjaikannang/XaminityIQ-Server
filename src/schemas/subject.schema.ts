import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject {

    @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
    batchId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ required: true })
    semester: number;

    @Prop({ required: true })
    subjectCode: string;

    @Prop({ required: true })
    subjectName: string;

    @Prop({ required: true })
    subjectType: string;

    @Prop({ required: true })
    credits: number;

    @Prop({ default: false })
    isElective: boolean;

    @Prop({ default: false })
    isLab: boolean;

}

export const SubjectSchema = SchemaFactory.createForClass(Subject);