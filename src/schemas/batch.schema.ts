import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Status } from "src/utils/enum";

export type BatchDocument = Batch & Document;

@Schema({ timestamps: true })
export class Batch {
    @Prop({ required: true, unique: true })
    batchCode: string; // e.g., "2020-2023", "2021-2024"

    @Prop({ required: true })
    startYear: number; // 2020

    @Prop({ required: true })
    endYear: number; // 2023   

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Branch' })
    branchId?: Types.ObjectId; // Optional, some courses might not have branches   

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;  
}

export const BatchSchema = SchemaFactory.createForClass(Batch);

// Indexes
BatchSchema.index({ batchCode: 1 });
BatchSchema.index({ courseId: 1 });
BatchSchema.index({ branchId: 1 });
BatchSchema.index({ startYear: 1 });
BatchSchema.index({ endYear: 1 });
BatchSchema.index({ status: 1 });

// Compound indexes
BatchSchema.index({ courseId: 1, branchId: 1 });
BatchSchema.index({ courseId: 1, startYear: 1 });
BatchSchema.index({ status: 1, admissionStatus: 1 });