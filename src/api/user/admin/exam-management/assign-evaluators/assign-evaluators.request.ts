import { IsArray, IsMongoId } from 'class-validator';

export class AssignEvaluatorsRequest {

    @IsArray()
    @IsMongoId({ each: true })
    evaluatorFacultyIds: string[];

}
