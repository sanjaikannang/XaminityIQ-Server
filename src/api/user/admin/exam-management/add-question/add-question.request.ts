import { Type } from 'class-transformer';
import { QuestionType } from 'src/utils/enum';
import {
    IsString, IsNotEmpty, IsEnum, IsInt, Min, IsOptional, IsMongoId,
    IsBoolean, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize, ValidateIf,
} from 'class-validator';

// Question types that don't take multiple-choice options — free-form
// answers evaluated separately (photo upload / typed text).
const OPTIONLESS_TYPES: QuestionType[] = [QuestionType.WRITTEN, QuestionType.TYPING];

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
    @ValidateIf((o) => !OPTIONLESS_TYPES.includes(o.type))
    @IsArray()
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @ValidateNested({ each: true })
    @Type(() => QuestionOptionInput)
    options?: QuestionOptionInput[];

    // Optional — must reference one of the parent Exam's examSections[]._id
    @IsOptional()
    @IsMongoId()
    examSectionId?: string;

}
