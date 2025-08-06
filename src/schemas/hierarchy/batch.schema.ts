import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Status } from "src/utils/enum";

export type BatchDocument = Batch & Document;

@Schema({ timestamps: true })
export class Batch {
    @Prop({ required: true, unique: true })
    name: string; // e.g., "2020-2023", "2021-2024"

    @Prop({ required: true })
    startYear: number; // 2020

    @Prop({ required: true })
    endYear: number; // 2023

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const BatchSchema = SchemaFactory.createForClass(Batch);

// Indexes
BatchSchema.index({ name: 1 });
BatchSchema.index({ startYear: 1 });
BatchSchema.index({ endYear: 1 });
BatchSchema.index({ status: 1 });

// Compound indexes
BatchSchema.index({ startYear: 1, endYear: 1 });
BatchSchema.index({ status: 1, startYear: 1 });