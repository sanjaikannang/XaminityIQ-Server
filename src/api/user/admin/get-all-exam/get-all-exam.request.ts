import { Type } from "class-transformer";
import { IsOptional, Min } from "class-validator";

export class GetAllExamRequest {

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    limit?: number = 10;

}