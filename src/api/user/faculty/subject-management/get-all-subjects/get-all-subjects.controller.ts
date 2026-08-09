import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetAllSubjectsRequest } from './get-all-subjects.request';
import { GetAllSubjectsResponse } from './get-all-subjects.response';

@Controller('faculty')
export class GetAllSubjectsController {
    constructor(private readonly facultyService: FacultyService) { }

    @Get('subjects')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getAllSubjects(
        @Req() req: Request,
        @Query() query: GetAllSubjectsRequest,
    ): Promise<GetAllSubjectsResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.facultyService.getMySubjectsAPI(userId, query);

        return {
            success: true,
            message: 'Subjects fetched successfully',
            data: result.subjects,
            pagination: result.pagination,
        };
    }
}
