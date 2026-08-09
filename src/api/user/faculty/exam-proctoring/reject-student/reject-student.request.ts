import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectStudentRequest {

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    reason: string;

}
