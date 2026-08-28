import { IsArray, IsOptional, IsString } from 'class-validator';

export class SaveAnswerRequest {

    @IsOptional()
    @IsString()
    selectedOptionId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    selectedOptionIds?: string[];

    // TYPING only — HTML from the Tiptap editor
    @IsOptional()
    @IsString()
    answerText?: string;

}
