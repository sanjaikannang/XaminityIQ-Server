import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BatchCourseDocument = BatchCourse & Document;

@Schema({ timestamps: true })
export class BatchCourse {

    @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
    batchId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

}

export const BatchCourseSchema = SchemaFactory.createForClass(BatchCourse);