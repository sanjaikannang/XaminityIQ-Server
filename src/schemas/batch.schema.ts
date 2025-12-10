import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BatchDocument = Batch & Document;

@Schema({ timestamps: true })
export class Batch {

    @Prop({ required: true })
    batchName: string;

    @Prop({ required: true })
    startYear: number;

    @Prop({ required: true })
    endYear: number;

}

export const BatchSchema = SchemaFactory.createForClass(Batch);