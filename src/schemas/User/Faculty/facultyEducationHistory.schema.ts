import { Types } from "mongoose";
import { EducationLevel } from "src/utils/enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type FacultyEducationHistoryDocument = FacultyEducationHistory & Document;

@Schema({ timestamps: true })
export class FacultyEducationHistory {
    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    facultyId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(EducationLevel) })
    level: string; // SECONDARY | HIGHER_SECONDARY | UNDERGRADUATE | POSTGRADUATE | DOCTORATE

    @Prop({ required: true })
    qualification: string; // 10th | 12th | BE | BTECH | ME | MTECH | MBA | MSC | PhD

    @Prop({ required: true })
    boardOrUniversity: string;

    @Prop({ required: true })
    institutionName: string;

    @Prop({ required: true })
    yearOfPassing: number;

    @Prop({ required: true })
    percentageOrCGPA: number;

    @Prop()
    specialization: string;

    @Prop()
    remarks: string;
}

export const FacultyEducationHistorySchema = SchemaFactory.createForClass(FacultyEducationHistory);

FacultyEducationHistorySchema.index({ facultyId: 1 });
