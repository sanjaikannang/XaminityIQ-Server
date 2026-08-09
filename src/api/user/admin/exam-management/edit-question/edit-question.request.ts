import { Type } from 'class-transformer';
import { QuestionType } from 'src/utils/enum';
import { QuestionOptionInput } from '../add-question/add-question.request';
import {
    IsString, IsNotEmpty, IsEnum, IsInt, Min, IsOptional,
    IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize,
} from 'class-validator';

export class EditQuestionRequest {

    @IsOptional()
    @IsEnum(QuestionType)
    type?: QuestionType;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    text?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    marks?: number;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @ValidateNested({ each: true })
    @Type(() => QuestionOptionInput)
    options?: QuestionOptionInput[];

}
