import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetAllSubjectsRequest } from './get-all-subjects.request';
import { GetAllSubjectsResponse } from './get-all-subjects.response';

@Controller('admin')
export class GetAllSubjectsController {
    constructor(private readonly adminService: AdminService) { }

    @Get('subjects')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllSubjects(@Query() query: GetAllSubjectsRequest): Promise<GetAllSubjectsResponse> {
        const result = await this.adminService.getAllSubjectsAPI(query);

        return {
            success: true,
            message: 'Subjects fetched successfully',
            data: result.subjects,
            pagination: result.pagination,
        };
    }
}
