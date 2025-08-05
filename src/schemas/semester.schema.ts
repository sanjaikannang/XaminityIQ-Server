import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Status } from "src/utils/enum";

export type SemesterDocument = Semester & Document;

@Schema({ timestamps: true })
export class Semester {
    @Prop({ required: true })
    semesterNumber: number; // 1, 2, 3, 4, 5, 6, 7, 8   

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }] })
    applicableCourses: Types.ObjectId[]; // Which courses have this semester

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const SemesterSchema = SchemaFactory.createForClass(Semester);

// Indexes
SemesterSchema.index({ semesterNumber: 1 });
SemesterSchema.index({ status: 1 });
SemesterSchema.index({ applicableCourses: 1 });