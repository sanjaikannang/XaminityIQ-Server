import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

const SUBJECT_SORT_FIELDS = ['subjectCode', 'subjectName', 'credits', 'subjectType', 'createdAt'] as const;

export class GetAllSubjectsRequest {

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    semester?: number;

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
    @IsIn(SUBJECT_SORT_FIELDS)
    sortBy?: string;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';

}
