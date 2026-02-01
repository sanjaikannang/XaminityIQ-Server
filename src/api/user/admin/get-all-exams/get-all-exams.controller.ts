import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetAllExamsRequest } from './get-all-exams.request';
import { GetAllExamsResponse } from './get-all-exams.response';
import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';

@Controller('admin')
export class GetAllExamsController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllExams(
        @Query() query: GetAllExamsRequest
    ): Promise<GetAllExamsResponse> {

        const result = await this.adminService.getAllExamsAPI(query);

        const response: GetAllExamsResponse = {
            success: true,
            message: result.exams.length > 0
                ? 'Exams fetched successfully'
                : 'No exams found',
            data: result.exams,
            pagination: result.pagination
        };

        return response;
    }
}