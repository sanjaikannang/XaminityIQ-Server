import { Document, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BoardType, EducationLevel, Qualification } from "src/utils/enum";

export type StudentEducationHistoryDocument = StudentEducationHistory & Document;

@Schema({ timestamps: true })
export class StudentEducationHistory {
    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(EducationLevel) })
    level: string;

    @Prop({ required: true, enum: Object.values(Qualification) })
    qualification: string;

    @Prop({ required: true, enum: Object.values(BoardType) })
    boardOrUniversity: string;

    @Prop({ required: true })
    institutionName: string;

    @Prop({ required: true })
    yearOfPassing: number;

    @Prop({ required: true })
    percentageOrCGPA: number;

    @Prop()
    remarks: string;
}

export const StudentEducationHistorySchema = SchemaFactory.createForClass(StudentEducationHistory);

StudentEducationHistorySchema.index({ studentId: 1 });