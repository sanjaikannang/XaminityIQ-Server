import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RemoveStudentRequest {

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    reason: string;

}
