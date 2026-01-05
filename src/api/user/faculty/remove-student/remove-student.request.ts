import { IsMongoId, IsString } from 'class-validator';

export class RemoveStudentRequest {

    @IsMongoId()
    studentId: string;

    @IsString()
    reason: string;

}
