import { Type } from "class-transformer";
import { FacultyDesignation, EmploymentType, FacultyStatus } from "src/utils/enum";
import { IsIn, IsInt, IsMongoId, IsEnum, IsOptional, IsString, Min } from "class-validator";

const FACULTY_SORT_FIELDS = ['employeeId', 'name', 'designation', 'employmentType', 'status', 'createdAt'] as const;

export class GetAllFacultyRequest {
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
    departmentId?: string;

    @IsOptional()
    @IsEnum(FacultyDesignation)
    designation?: FacultyDesignation;

    @IsOptional()
    @IsEnum(EmploymentType)
    employmentType?: EmploymentType;

    @IsOptional()
    @IsEnum(FacultyStatus)
    status?: FacultyStatus;

    @IsOptional()
    @IsIn(FACULTY_SORT_FIELDS)
    sortBy?: string;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}