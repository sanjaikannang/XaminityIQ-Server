import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
    ExamMode,
    ExamStatus,
    AudienceType,
    QuestionRandomizationLevel,
    ProctoringMode,
    CorrectionMode
} from 'src/utils/enum';

export type ExamDocument = Exam & Document;

// Media schema for reusability
@Schema({ _id: false })
export class Media {
    @Prop({ required: true, enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'] })
    mediaType: string;

    @Prop({ required: true })
    mediaUrl: string;

    @Prop()
    mediaDescription?: string;

    @Prop()
    mediaSize?: number;

    @Prop()
    mimeType?: string;
}

// Faculty assignment schema for proctoring and correction
@Schema({ _id: false })
export class FacultyAssignment {
    @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true })
    facultyId: Types.ObjectId;

    @Prop({ required: true })
    facultyName: string;

    @Prop()
    maxStudentsPerFaculty?: number;

    @Prop()
    maxPapersPerFaculty?: number;

    @Prop({ type: [String] })
    assignedSections?: string[];

    @Prop({ type: [String] })
    assignedQuestionTypes?: string[];

    @Prop({
        type: {
            email: { type: String },
            phone: { type: String }
        }
    })
    contactInfo?: {
        email?: string;
        phone?: string;
    };

    @Prop({
        type: {
            facultyId: { type: Types.ObjectId, ref: 'Faculty' },
            facultyName: { type: String }
        }
    })
    backupFaculty?: {
        facultyId: Types.ObjectId;
        facultyName: string;
    };
}

@Schema({ timestamps: true })
export class Exam {
    @Prop({ required: true })
    examTitle: string;

    @Prop()
    examDescription?: string;

    @Prop({ required: true })
    academicYear: string;

    @Prop({ required: true })
    semester: string;

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true, min: 0 })
    totalMarks: number;

    @Prop({ required: true, min: 0 })
    passingMarks: number;

    @Prop({ required: true, min: 1 })
    duration: number; // in minutes

    @Prop({ required: true, enum: ExamMode })
    examMode: ExamMode;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop()
    instructions?: string;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop({ required: true, enum: ExamStatus, default: ExamStatus.DRAFT })
    status: ExamStatus;

    // Target Audience Configuration
    @Prop({ required: true, enum: AudienceType })
    audienceType: AudienceType;

    @Prop({
        type: {
            batchId: { type: String },
            batchName: { type: String },
            academicYear: { type: String }
        }
    })
    batchDetails?: {
        batchId?: string;
        batchName?: string;
        academicYear?: string;
    };

    @Prop({
        type: {
            courseId: { type: String },
            courseName: { type: String },
            courseCode: { type: String }
        }
    })
    courseDetails?: {
        courseId?: string;
        courseName?: string;
        courseCode?: string;
    };

    @Prop({
        type: {
            branchId: { type: String },
            branchName: { type: String },
            branchCode: { type: String }
        }
    })
    branchDetails?: {
        branchId?: string;
        branchName?: string;
        branchCode?: string;
    };

    @Prop({
        type: {
            sectionIds: { type: [String] },
            sectionNames: { type: [String] }
        }
    })
    sectionDetails?: {
        sectionIds?: string[];
        sectionNames?: string[];
    };

    // Schedule Details
    @Prop({ required: true })
    examDate: Date;

    @Prop({ required: true })
    startTime: string; // HH:MM format

    @Prop({ required: true })
    endTime: string; // HH:MM format

    @Prop({ default: 'UTC+05:30' })
    timezone: string;

    @Prop({
        type: {
            beforeExam: { type: Number, default: 15 },
            afterExam: { type: Number, default: 15 }
        }
    })
    bufferTime: {
        beforeExam: number;
        afterExam: number;
    };

    // Question Selection Strategy
    @Prop({
        enum: QuestionRandomizationLevel,
        default: QuestionRandomizationLevel.NONE
    })
    randomizationLevel: QuestionRandomizationLevel;

    @Prop()
    questionsPerSection?: number;

    // Proctoring Configuration
    @Prop({ enum: ProctoringMode, default: ProctoringMode.AUTO })
    proctoringMode: ProctoringMode;

    @Prop({
        type: {
            enabled: { type: Boolean, default: false },
            facultyAssignment: { type: [FacultyAssignment] }
        }
    })
    liveProctoringConfig?: {
        enabled: boolean;
        facultyAssignment: FacultyAssignment[];
    };

    @Prop({
        type: {
            enabled: { type: Boolean, default: true },
            settings: {
                faceDetection: { type: Boolean, default: true },
                tabSwitchDetection: { type: Boolean, default: true },
                screenRecording: { type: Boolean, default: false },
                microphoneMonitoring: { type: Boolean, default: false }
            }
        }
    })
    autoProctoringConfig: {
        enabled: boolean;
        settings: {
            faceDetection: boolean;
            tabSwitchDetection: boolean;
            screenRecording: boolean;
            microphoneMonitoring: boolean;
        };
    };

    // Correction Configuration
    @Prop({ required: true, enum: CorrectionMode })
    correctionMode: CorrectionMode;

    @Prop({
        type: {
            enabledQuestionTypes: {
                type: [String],
                default: ['MCQ', 'TRUE_FALSE', 'FILL_BLANK', 'NUMERICAL', 'MULTIPLE_SELECT']
            }
        }
    })
    automaticCorrection: {
        enabledQuestionTypes: string[];
    };

    @Prop({
        type: {
            facultyAssignment: { type: [FacultyAssignment] }
        }
    })
    manualCorrection?: {
        facultyAssignment: FacultyAssignment[];
    };

    // Result Declaration
    @Prop()
    resultDeclarationDate?: Date;

    @Prop({
        type: {
            showDetailedResults: { type: Boolean, default: true },
            showCorrectAnswers: { type: Boolean, default: true },
            showSolutions: { type: Boolean, default: true }
        }
    })
    resultVisibility: {
        showDetailedResults: boolean;
        showCorrectAnswers: boolean;
        showSolutions: boolean;
    };

    // Exam Sections (references to questions)
    @Prop({ type: [Types.ObjectId], ref: 'ExamSection', default: [] })
    examSections: Types.ObjectId[];

    // Statistics
    @Prop({ default: 0 })
    totalAttempts: number;

    @Prop({ default: 0 })
    completedAttempts: number;

    @Prop()
    averageScore?: number;

    @Prop()
    highestScore?: number;

    @Prop()
    lowestScore?: number;

    // Audit fields
    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: Types.ObjectId;

    @Prop()
    publishedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    publishedBy?: Types.ObjectId;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

// Indexes for better performance
ExamSchema.index({ createdBy: 1 });
ExamSchema.index({ status: 1 });
ExamSchema.index({ examDate: 1 });
ExamSchema.index({ academicYear: 1, semester: 1 });
ExamSchema.index({ subject: 1 });
ExamSchema.index({ audienceType: 1 });
ExamSchema.index({ 'batchDetails.batchId': 1 });
ExamSchema.index({ 'courseDetails.courseId': 1 });
ExamSchema.index({ 'branchDetails.branchId': 1 });
ExamSchema.index({ tags: 1 });
ExamSchema.index({ createdAt: -1 });

// Compound indexes
ExamSchema.index({ status: 1, examDate: 1 });
ExamSchema.index({ createdBy: 1, status: 1 });
ExamSchema.index({ academicYear: 1, semester: 1, subject: 1 });