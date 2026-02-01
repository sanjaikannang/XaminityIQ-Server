import { Type } from "class-transformer";
import { ExamMode, ExamStatus } from "src/utils/enum";
import { IsInt, IsOptional, IsString, Min, IsEnum } from "class-validator";

export class GetAllExamsRequest {

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(ExamMode)
    examMode?: ExamMode;

    @IsOptional()
    @IsEnum(ExamStatus)
    status?: ExamStatus;

}