import { Document, Types } from 'mongoose';
import { SubjectType } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject {

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ required: true })
    semester: number;

    @Prop({ required: true, unique: true })
    subjectCode: string;

    @Prop({ required: true })
    subjectName: string;

    @Prop({ required: true })
    credits: number;

    @Prop({ required: true, enum: Object.values(SubjectType) })
    subjectType: string;

    @Prop()
    description: string;

    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    createdBy: Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;

}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

SubjectSchema.index({ departmentId: 1, semester: 1 });
