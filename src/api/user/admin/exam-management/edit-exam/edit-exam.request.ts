import { Type } from 'class-transformer';
import { ExamMode } from 'src/utils/enum';
import { ExamSectionInput, SecuritySettingsInput } from '../create-exam/create-exam.request';
import {
    IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId, IsInt, Min,
    IsDateString, ValidateNested, IsArray, ArrayMinSize,
} from 'class-validator';

export class EditExamRequest {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(ExamMode)
    mode?: ExamMode;

    @IsOptional()
    @IsMongoId()
    batchId?: string;

    @IsOptional()
    @IsMongoId()
    courseId?: string;

    @IsOptional()
    @IsMongoId()
    departmentId?: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    sectionIds?: string[];

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    @Min(1, { each: true })
    semesters?: number[];

    @IsOptional()
    @IsMongoId()
    subjectId?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    durationMinutes?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    totalMarks?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    passingMarks?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    startTime?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    endTime?: string;

    // Replaces the full list when provided (matches how securitySettings is
    // already edited as a whole nested object, not per-field).
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
