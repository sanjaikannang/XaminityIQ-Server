import { IsInt, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';

export class EvaluateAnswerRequest {

    @IsInt()
    @Min(0)
    @Max(1000)
    marksAwarded: number;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    remarks?: string;

}
