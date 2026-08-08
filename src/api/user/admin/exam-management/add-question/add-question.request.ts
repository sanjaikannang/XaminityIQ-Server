import { Type } from 'class-transformer';
import { QuestionType } from 'src/utils/enum';
import {
    IsString, IsNotEmpty, IsEnum, IsInt, Min, IsOptional,
    IsBoolean, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize, ValidateIf,
} from 'class-validator';

export class QuestionOptionInput {

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsBoolean()
    isCorrect: boolean;

}

export class AddQuestionRequest {

    @IsEnum(QuestionType)
    type: QuestionType;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsInt()
    @Min(1)
    marks: number;

    // MCQ/MSQ only — exactly 4 entries
    @ValidateIf((o) => o.type !== QuestionType.WRITTEN)
    @IsArray()
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @ValidateNested({ each: true })
    @Type(() => QuestionOptionInput)
    options?: QuestionOptionInput[];

}
