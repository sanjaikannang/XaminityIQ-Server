import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FacultyStatus } from 'src/utils/enum';

export type FacultyDocument = Faculty & Document;

@Schema({ timestamps: true })
export class Faculty {

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

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ required: true })
    designation: string;

    @Prop({ required: true, unique: true })
    employeeCode: string;

    @Prop({
        type: String,
        enum: FacultyStatus,
        required: true,
        default: FacultyStatus.ACTIVE,
    })
    status: string;

    @Prop({ default: false })
    isDeleted: boolean;

}

export const FacultySchema = SchemaFactory.createForClass(Faculty);