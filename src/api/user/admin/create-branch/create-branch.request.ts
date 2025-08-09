import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateBranchRequest {

    @IsString()
    @IsNotEmpty()
    name: string; // e.g., "Computer Science", "Information Technology"

    @IsString()
    @IsNotEmpty()
    code: string; // e.g., "CS", "IT", "ECE"

    @IsMongoId()
    @IsNotEmpty()
    courseId: string;

}