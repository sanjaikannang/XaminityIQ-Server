import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Status } from "src/utils/enum";

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {
    @Prop({ required: true })
    name: string; // e.g., "A", "B", "C"

    @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
    branchId: Types.ObjectId;

    @Prop({ type: Number, min: 1 })
    capacity?: number; // Maximum number of students in this section

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const SectionSchema = SchemaFactory.createForClass(Section);

// Indexes
SectionSchema.index({ name: 1 });
SectionSchema.index({ branchId: 1 });
SectionSchema.index({ status: 1 });

// Compound indexes
SectionSchema.index({ branchId: 1, status: 1 });
SectionSchema.index({ branchId: 1, name: 1 });

// Unique compound index to prevent duplicate section names within the same branch
SectionSchema.index({ branchId: 1, name: 1 }, { unique: true });