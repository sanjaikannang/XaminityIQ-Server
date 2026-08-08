import { SubjectType } from 'src/utils/enum';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class EditSubjectRequest {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    subjectCode?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    subjectName?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    semester?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    credits?: number;

    @IsOptional()
    @IsEnum(SubjectType)
    subjectType?: SubjectType;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

}
