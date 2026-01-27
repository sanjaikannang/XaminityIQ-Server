import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsNumber,
    IsArray,
    ArrayMaxSize,
    Min,
    IsEnum
} from 'class-validator';
import { ExamMode } from 'src/utils/enum';

export class CreateExamRequest {
    @IsEnum(ExamMode)
    examMode: ExamMode;

    @IsString()
    @IsNotEmpty()
    examName: string;

    @IsDateString()
    date: string;

    @IsString()
    @IsNotEmpty()
    time: string;

    @IsNumber()
    @Min(1)
    duration: number;

    @IsString()
    @IsNotEmpty()
    facultyId: string;

    @IsArray()
    @ArrayMaxSize(1)
    studentIds: string[];
}
