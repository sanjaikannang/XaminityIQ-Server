import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Status } from "src/utils/enum";

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true })
export class Branch {
    @Prop({ required: true })
    branchCode: string; // e.g., "CS", "IT", "ECE"

    @Prop({ required: true })
    branchName: string; // e.g., "Computer Science", "Information Technology"   

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }] })
    applicableCourses: Types.ObjectId[]; // Which courses can have this branch

    @Prop()
    departmentName?: string; // Department this branch belongs to   

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);

// Indexes
BranchSchema.index({ branchCode: 1 });
BranchSchema.index({ status: 1 });
BranchSchema.index({ applicableCourses: 1 });

// Compound index for course-branch combination
BranchSchema.index({ branchCode: 1, status: 1 });