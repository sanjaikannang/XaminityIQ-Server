import { Type } from 'class-transformer';
import { ExamMode } from 'src/utils/enum';
import { SecuritySettingsInput } from '../create-exam/create-exam.request';
import {
    IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId, IsInt, Min,
    IsDateString, ValidateNested,
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
    @IsMongoId()
    sectionId?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    semester?: number;

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

    @IsOptional()
    @ValidateNested()
    @Type(() => SecuritySettingsInput)
    securitySettings?: SecuritySettingsInput;

}
