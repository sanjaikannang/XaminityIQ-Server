import { IsString, IsNotEmpty } from 'class-validator';

export class FacultyJoinExamRequest {
    @IsString()
    @IsNotEmpty()
    facultyId: string;
}