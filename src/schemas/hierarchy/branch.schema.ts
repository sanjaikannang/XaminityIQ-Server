import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Status } from "src/utils/enum";

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true })
export class Branch {
    @Prop({ required: true })
    name: string; // e.g., "Computer Science", "Information Technology"

    @Prop({ required: true })
    code: string; // e.g., "CS", "IT", "ECE"

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;    

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);

// Indexes
BranchSchema.index({ name: 1 });
BranchSchema.index({ code: 1 });
BranchSchema.index({ courseId: 1 });
BranchSchema.index({ status: 1 });

// Compound indexes
BranchSchema.index({ courseId: 1, status: 1 });
BranchSchema.index({ courseId: 1, name: 1 });
BranchSchema.index({ code: 1, status: 1 });