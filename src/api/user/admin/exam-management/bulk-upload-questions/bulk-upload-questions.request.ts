import { Type } from 'class-transformer';
import { ValidateNested, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { AddQuestionRequest } from '../add-question/add-question.request';

export class BulkUploadQuestionsRequest {

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(200)
    @ValidateNested({ each: true })
    @Type(() => AddQuestionRequest)
    questions: AddQuestionRequest[];

}
