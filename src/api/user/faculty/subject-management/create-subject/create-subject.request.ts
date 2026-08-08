import { SubjectType } from 'src/utils/enum';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateSubjectRequest {

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    subjectCode: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    subjectName: string;

    @IsInt()
    @Min(1)
    semester: number;

    @IsNumber()
    @Min(1)
    credits: number;

    @IsEnum(SubjectType)
    subjectType: SubjectType;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

}
