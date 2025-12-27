import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {

    @Prop({ required: true })
    streamCode: string;

    @Prop({ required: true })
    streamName: string;

    @Prop({ required: true, unique: true })
    courseCode: string;

    @Prop({ required: true })
    courseName: string;

    @Prop({ required: true })
    level: string;

    @Prop({ required: true })
    duration: string;

    @Prop({ required: true })
    semesters: number;

}

export const CourseSchema = SchemaFactory.createForClass(Course);