import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ExamMode, ExamStatus, Status } from "src/utils/enum";

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {
    @Prop({ required: true, unique: true })
    examId: string; // e.g., EXM001, EXM002

    @Prop({ required: true })
    examTitle: string;

    @Prop({ type: String })
    examDescription?: string;

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true, min: 0 })
    totalMarks: number;

    @Prop({ required: true, min: 0 })
    passingMarks: number;

    @Prop({ required: true, min: 1 }) // Duration in minutes
    duration: number;

    @Prop({ required: true, enum: ExamMode })
    examMode: ExamMode;

    @Prop({ type: [String], default: [] })
    generalInstructions: string[];

    @Prop({ required: true, enum: ExamStatus, default: ExamStatus.DRAFT })
    examStatus: ExamStatus;

    // Target Audience
    @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
    batchId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
    branchId: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: 'Section', default: [] })
    sectionIds: Types.ObjectId[]; // Multiple sections can take the same exam

    // Schedule Details
    @Prop({
        type: {
            // For PROCTORING mode
            examDate: { type: Date },
            startTime: { type: String }, // "09:00"
            endTime: { type: String }, // "12:00"

            // For AUTO mode
            startDate: { type: Date },
            endDate: { type: Date },

            // Buffer time (in minutes)
            bufferTime: {
                beforeExam: { type: Number, default: 0 },
                afterExam: { type: Number, default: 0 }
            }
        }
    })
    scheduleDetails: {
        examDate?: Date;
        startTime?: string;
        endTime?: string;
        startDate?: Date;
        endDate?: Date;
        bufferTime: {
            beforeExam: number;
            afterExam: number;
        };
    };

    // Faculty Assignment (for AUTO mode evaluation)
    @Prop({ type: [Types.ObjectId], ref: 'Faculty', default: [] })
    assignedFacultyIds: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

// Indexes
ExamSchema.index({ examId: 1 });
ExamSchema.index({ examStatus: 1 });
ExamSchema.index({ examMode: 1 });
ExamSchema.index({ batchId: 1, courseId: 1, branchId: 1 });
ExamSchema.index({ createdBy: 1 });
ExamSchema.index({ status: 1 });

// Compound indexes
ExamSchema.index({ examStatus: 1, 'scheduleDetails.examDate': 1 });
ExamSchema.index({ examStatus: 1, 'scheduleDetails.startDate': 1, 'scheduleDetails.endDate': 1 });