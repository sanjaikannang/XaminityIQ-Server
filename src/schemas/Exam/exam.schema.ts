import { Document, Types } from 'mongoose';
import { ExamMode, ExamStatus } from 'src/utils/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExamDocument = Exam & Document;

@Schema({ _id: false })
export class SecuritySettings {

    @Prop({ default: false })
    shuffleQuestions: boolean;

    @Prop({ default: false })
    shuffleOptions: boolean;

    @Prop({ default: true })
    disableCopyPaste: boolean;

    @Prop({ default: true })
    disableRightClick: boolean;

    @Prop({ default: true })
    requireFullScreenThroughout: boolean;

    @Prop({ default: false })
    blockBackwardNavigation: boolean;

    @Prop({ default: 3 })
    tabSwitchViolationThreshold: number;

    @Prop({ default: 3 })
    fullScreenExitViolationThreshold: number;

    @Prop({ default: 2 })
    connectionLossGracePeriodMinutes: number;

    @Prop({ default: 2 })
    cameraMicLossGracePeriodMinutes: number;

    @Prop({ default: false })
    faceDetectionEnabled: boolean;

    // 0 (default) means no minimum — disabled
    @Prop({ default: 0 })
    minTimePerQuestionSeconds: number;

    // 0 (default) means no minimum — disabled
    @Prop({ default: 0 })
    minTimePerExamMinutes: number;

}

// A named group of questions within an exam ("Section A", "Section B", ...),
// purely an authoring/navigation grouping — not to be confused with the
// academic `Section` (class/division) referenced by `Exam.sectionId` below.
// Not `{ _id: false }`: each entry keeps its own ObjectId so `ExamQuestion`
// can reference it via `examSectionId`.
@Schema()
export class ExamSectionDef {

    @Prop({ required: true })
    label: string;

    @Prop({ required: true })
    order: number;

}

@Schema({ timestamps: true })
export class Exam {

    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true, enum: Object.values(ExamMode) })
    mode: string;

    @Prop({ required: true, enum: Object.values(ExamStatus), default: ExamStatus.DRAFT })
    status: string;

    @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
    batchId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
    departmentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
    sectionId: Types.ObjectId;

    // Plain number, matching Subject.semester / StudentAcademicDetail.currentSemester —
    // there is no separate Semester collection in this app.
    @Prop({ required: true })
    semester: number;

    @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
    subjectId: Types.ObjectId;

    @Prop({ required: true })
    durationMinutes: number;

    @Prop({ required: true })
    totalMarks: number;

    @Prop({ required: true })
    passingMarks: number;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    // "HH:mm", e.g. "09:00" — always IST (see src/utils/date.util.ts).
    // Required for both AUTO and PROCTORING modes.
    @Prop({ required: true })
    startTime: string;

    @Prop({ required: true })
    endTime: string;

    @Prop({ type: [ExamSectionDef], default: [] })
    examSections: ExamSectionDef[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Faculty' }], default: [] })
    evaluatorFacultyIds: Types.ObjectId[];

    @Prop({ type: SecuritySettings, default: () => ({}) })
    securitySettings: SecuritySettings;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

}

export const ExamSchema = SchemaFactory.createForClass(Exam);

ExamSchema.index({ batchId: 1, courseId: 1, departmentId: 1, sectionId: 1, semester: 1, subjectId: 1 });
ExamSchema.index({ mode: 1, status: 1 });
ExamSchema.index({ startDate: 1, endDate: 1, startTime: 1, endTime: 1, durationMinutes: 1 });
ExamSchema.index({ status: 1 });
