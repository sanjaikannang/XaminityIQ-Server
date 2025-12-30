import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsDateString,
    IsNumber,
    Min,
    Max,
    IsArray,
    ArrayNotEmpty,
    ValidateIf,
    IsMongoId
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExamMode } from 'src/utils/enum';

export class CreateExamRequest {

    @IsString()
    @IsNotEmpty()
    examName: string;

    @IsDateString()
    @IsNotEmpty()
    examDate: string; // ISO 8601 format

    @IsString()
    @IsNotEmpty()
    startTime: string; // Format: "HH:mm"

    @IsString()
    @IsNotEmpty()
    endTime: string; // Format: "HH:mm"

    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    duration: number; // Duration in minutes

    @IsEnum(ExamMode)
    @IsNotEmpty()
    mode: ExamMode;

    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true })
    @Type(() => String)
    studentIds: string[]; // Array of Student ObjectIds

    // Faculty is only required if mode is PROCTORING
    @ValidateIf((o) => o.mode === ExamMode.PROCTORING)
    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true })
    @Type(() => String)
    facultyIds?: string[]; // Array of Faculty ObjectIds (optional for AUTO mode)

    @IsNumber()
    @Min(1)
    @Max(20)
    @IsNotEmpty()
    maxStudentsPerRoom: number; // Maximum students per room (default: 20)

}