import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { EducationLevel } from "src/utils/enum";

export type StudentEducationHistoryDocument = StudentEducationHistory & Document;

@Schema({ timestamps: true })
export class StudentEducationHistory {
    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(EducationLevel) })
    level: string; // SECONDARY | HIGHER_SECONDARY | DIPLOMA | UNDERGRADUATE

    @Prop({ required: true })
    qualification: string; // 10th | 12th | Diploma | Degree

    @Prop({ required: true })
    boardOrUniversity: string; // STATE_BOARD | CBSE | ICSE | University Name

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