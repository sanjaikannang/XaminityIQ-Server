import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveStudentRequest {
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @IsString()
    @IsNotEmpty()
    reason: string;
}
