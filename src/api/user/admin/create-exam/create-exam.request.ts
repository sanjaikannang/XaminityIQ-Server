import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsNumber,
    IsArray,
    Min,
    IsEnum,
    ValidateIf,
    ArrayMinSize,
    ArrayMaxSize,
    IsOptional
} from 'class-validator';
import { ExamMode } from 'src/utils/enum';

export class CreateExamRequest {
    @IsEnum(ExamMode)
    examMode: ExamMode;

    @IsString()
    @IsNotEmpty()
    examName: string;

    @IsNumber()
    @Min(1)
    duration: number;

    // PROCTORING mode fields
    @ValidateIf(o => o.examMode === ExamMode.PROCTORING)
    @IsDateString()
    @IsNotEmpty()
    examDate?: string;

    @ValidateIf(o => o.examMode === ExamMode.PROCTORING)
    @IsString()
    @IsNotEmpty()
    startTime?: string;

    @ValidateIf(o => o.examMode === ExamMode.PROCTORING)
    @IsString()
    @IsNotEmpty()
    endTime?: string;

    @ValidateIf(o => o.examMode === ExamMode.PROCTORING)
    @IsString()
    @IsNotEmpty()
    facultyId?: string;

    // AUTO mode fields
    @ValidateIf(o => o.examMode === ExamMode.AUTO)
    @IsDateString()
    @IsNotEmpty()
    examStartDate?: string;

    @ValidateIf(o => o.examMode === ExamMode.AUTO)
    @IsDateString()
    @IsNotEmpty()
    examEndDate?: string;

    // studentIds - used by both modes with different validation
    @ValidateIf(o => o.examMode === ExamMode.PROCTORING)
    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @ValidateIf(o => o.examMode === ExamMode.AUTO)
    @IsArray()
    @IsOptional()
    studentIds?: string[];
}