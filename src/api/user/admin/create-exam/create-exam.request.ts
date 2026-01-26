import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsNumber,
    IsArray,
    ArrayMaxSize,
    Min
} from 'class-validator';

export class CreateExamRequest {
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
    @ArrayMaxSize(20)
    studentIds: string[];
}
