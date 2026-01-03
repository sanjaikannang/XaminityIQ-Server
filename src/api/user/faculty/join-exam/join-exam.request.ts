import { IsNotEmpty, IsString } from 'class-validator';

export class JoinExamRequest {

    @IsNotEmpty()
    @IsString()
    examId: string;

}