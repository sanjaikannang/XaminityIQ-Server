import { Type } from 'class-transformer';
import { ExamMode, ExamStatus } from 'src/utils/enum';
import { IsIn, IsInt, IsMongoId, IsEnum, IsOptional, IsString, Min } from 'class-validator';

const EXAM_SORT_FIELDS = ['name', 'mode', 'status', 'startDate', 'endDate', 'totalMarks', 'createdAt'] as const;

export class GetAllExamsRequest {

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
    @IsEnum(ExamMode)
    mode?: ExamMode;

    @IsOptional()
    @IsEnum(ExamStatus)
    status?: ExamStatus;

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
    @IsIn(EXAM_SORT_FIELDS)
    sortBy?: string;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';

}
