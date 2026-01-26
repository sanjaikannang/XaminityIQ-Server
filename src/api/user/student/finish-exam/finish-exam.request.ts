import { IsString, IsNotEmpty } from 'class-validator';

export class FinishExamRequest {
    @IsString()
    @IsNotEmpty()
    studentId: string;
}