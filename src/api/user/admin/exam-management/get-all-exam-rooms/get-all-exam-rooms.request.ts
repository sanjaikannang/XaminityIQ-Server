import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

const EFFECTIVE_STATUSES = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED'] as const;

export class GetAllExamRoomsRequest {

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;

    // Computed from the room's own schedule, not a persisted status — see
    // ExamRoomRepositoryService.buildEffectiveStatusFilter
    @IsOptional()
    @IsIn(EFFECTIVE_STATUSES)
    effectiveStatus?: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';

}
