import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { QuestionType, Status } from "src/utils/enum";

export type ExamSectionDocument = ExamSection & Document & { _id: Types.ObjectId };;

@Schema({ timestamps: true })
export class ExamSection {
    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ required: true })
    sectionName: string; // "Section A", "Part I", etc.

    @Prop({ required: true })
    sectionOrder: number; // 1, 2, 3... for ordering sections

    @Prop({ required: true, min: 0 })
    sectionMarks: number;

    @Prop({ required: true, enum: QuestionType })
    questionType: QuestionType;

    @Prop({ required: true, min: 1 })
    totalQuestions: number;

    @Prop({ type: [String], default: [] })
    sectionInstructions: string[];

    @Prop({ type: Boolean, default: false })
    isOptional: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const ExamSectionSchema = SchemaFactory.createForClass(ExamSection);

// Indexes
ExamSectionSchema.index({ examId: 1 });
ExamSectionSchema.index({ examId: 1, sectionOrder: 1 });
ExamSectionSchema.index({ status: 1 });