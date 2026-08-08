import { Type } from "class-transformer";
import { StudentStatus } from "src/utils/enum";
import { IsIn, IsInt, IsMongoId, IsEnum, IsOptional, IsString, Min } from "class-validator";

const STUDENT_SORT_FIELDS = ['rollNumber', 'name', 'semester', 'status', 'createdAt'] as const;

export class GetAllStudentsRequest {

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsMongoId()
    batchId?: string;

    @IsOptional()
    @IsMongoId()
    courseId?: string;

    @IsOptional()
    @IsMongoId()
    departmentId?: string;

    @IsOptional()
    @IsMongoId()
    sectionId?: string;

    @IsOptional()
    @IsEnum(StudentStatus)
    status?: StudentStatus;

    @IsOptional()
    @IsIn(STUDENT_SORT_FIELDS)
    sortBy?: string;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';

}