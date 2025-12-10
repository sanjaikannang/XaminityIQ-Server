import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FacultySubjectAssignmentDocument = FacultySubjectAssignment & Document;

@Schema({ timestamps: true })
export class FacultySubjectAssignment {

    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    facultyId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
    subjectId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
    batchId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ required: true })
    semester: number;

}

export const FacultySubjectAssignmentSchema = SchemaFactory.createForClass(FacultySubjectAssignment);