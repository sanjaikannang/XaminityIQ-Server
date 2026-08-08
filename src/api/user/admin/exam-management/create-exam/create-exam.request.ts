import { Type } from 'class-transformer';
import { ExamMode } from 'src/utils/enum';
import {
    IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId, IsInt, Min,
    IsDateString, ValidateIf, ValidateNested, IsBoolean,
} from 'class-validator';

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

    // PROCTORING only
    @ValidateIf((o) => o.mode === ExamMode.PROCTORING)
    @IsString()
    @IsNotEmpty()
    startTime?: string;

    @ValidateIf((o) => o.mode === ExamMode.PROCTORING)
    @IsString()
    @IsNotEmpty()
    endTime?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => SecuritySettingsInput)
    securitySettings?: SecuritySettingsInput;

}
