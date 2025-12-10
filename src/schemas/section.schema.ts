import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {

    @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
    batchId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ required: true })
    sectionName: string;

    @Prop({ required: true })
    capacity: number;

    @Prop({ default: 0 })
    currentStrength: number;

}

export const SectionSchema = SchemaFactory.createForClass(Section);