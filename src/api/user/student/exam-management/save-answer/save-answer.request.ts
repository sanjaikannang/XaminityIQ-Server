import { IsArray, IsOptional, IsString } from 'class-validator';

export class SaveAnswerRequest {

    @IsOptional()
    @IsString()
    selectedOptionId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    selectedOptionIds?: string[];

}
