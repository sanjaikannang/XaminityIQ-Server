import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/utils/enum';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
    @Prop({ required: true })
    name: string; // e.g., "B.Sc", "B.Com", "MCA", "BCA"

    @Prop({ required: true })
    fullName: string; // e.g., "Bachelor of Science", "Bachelor of Commerce"

    @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
    batchId: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    totalSemesters: number; // e.g., 6 for BSC, 4 for MCA

    @Prop({ required: true, min: 1 })
    durationYears: number; // e.g., 3 for BSC, 2 for MCA

    @Prop({ enum: ['UG', 'PG', 'DIPLOMA', 'CERTIFICATE'] })
    courseType: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Indexes
CourseSchema.index({ name: 1 });
CourseSchema.index({ batchId: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ courseType: 1 });

// Compound indexes
CourseSchema.index({ batchId: 1, status: 1 });
CourseSchema.index({ batchId: 1, name: 1 });