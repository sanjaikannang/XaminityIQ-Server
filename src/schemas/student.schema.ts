import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StudentStatus } from 'src/utils/enum';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
    batchId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
    sectionId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    rollNumber: string;

    @Prop({ required: true, unique: true })
    registrationNumber: string;

    @Prop({ required: true, default: 1 })
    currentSemester: number;

    @Prop({
        type: String,
        enum: StudentStatus,
        required: true,
        default: StudentStatus.ACTIVE,
    })
    status: string;

    @Prop({ default: false })
    isDeleted: boolean;

}

export const StudentSchema = SchemaFactory.createForClass(Student);