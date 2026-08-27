import { Type } from 'class-transformer';
import { ExamMode } from 'src/utils/enum';
import {
    IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId, IsInt, Min,
    IsDateString, ValidateNested, IsBoolean, IsArray, ArrayMinSize,
} from 'class-validator';

// A named group of questions ("Section A", "Section B", ...) — not to be
// confused with the academic `sectionId` (class/division) field below.
export class ExamSectionInput {

    // Omit when creating a new section; include an EXISTING section's id
    // (from a prior GetExam response) to rename/reorder it in place on edit
    // — Mongoose preserves a provided subdocument _id and only generates a
    // fresh one when absent, so existing ExamQuestion.examSectionId
    // references stay valid across an edit.
    @IsOptional()
    @IsMongoId()
    _id?: string;

    @IsString()
    @IsNotEmpty()
    label: string;

    @IsInt()
    @Min(1)
    order: number;

}

export class SecuritySettingsInput {

    @IsOptional()
    @IsBoolean()
    shuffleQuestions?: boolean;

    @IsOptional()
    @IsBoolean()
    shuffleOptions?: boolean;

    @IsOptional()
    @IsBoolean()
    disableCopyPaste?: boolean;

    @IsOptional()
    @IsBoolean()
    disableRightClick?: boolean;

    @IsOptional()
    @IsBoolean()
    requireFullScreenThroughout?: boolean;

    @IsOptional()
    @IsBoolean()
    blockBackwardNavigation?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    tabSwitchViolationThreshold?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    fullScreenExitViolationThreshold?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    connectionLossGracePeriodMinutes?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    cameraMicLossGracePeriodMinutes?: number;

    @IsOptional()
    @IsBoolean()
    faceDetectionEnabled?: boolean;

    // 0/omitted means no minimum — disabled
    @IsOptional()
    @IsInt()
    @Min(0)
    minTimePerQuestionSeconds?: number;

    // 0/omitted means no minimum — disabled
    @IsOptional()
    @IsInt()
    @Min(0)
    minTimePerExamMinutes?: number;

}

export class CreateExamRequest {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(ExamMode)
    mode: ExamMode;

    @IsMongoId()
    batchId: string;

    @IsMongoId()
    courseId: string;

    @IsMongoId()
    departmentId: string;

    @IsMongoId()
    sectionId: string;

    @IsInt()
    @Min(1)
    semester: number;

    @IsMongoId()
    subjectId: string;

    @IsInt()
    @Min(1)
    durationMinutes: number;

    @IsInt()
    @Min(1)
    totalMarks: number;

    @IsInt()
    @Min(1)
    passingMarks: number;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    // Required for both AUTO and PROCTORING — always IST (see date.util.ts)
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @IsString()
    @IsNotEmpty()
    endTime: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ExamSectionInput)
    examSections?: ExamSectionInput[];

    @IsOptional()
    @ValidateNested()
    @Type(() => SecuritySettingsInput)
    securitySettings?: SecuritySettingsInput;

}
