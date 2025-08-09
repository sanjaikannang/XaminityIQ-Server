import { Controller, Req, UseGuards, Get, Query } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetBranchesByCourseRequest } from './get-branches-by-course.request';
import { GetBranchesByCourseResponse } from './get-branches-by-course.response';


@Controller('admin')
export class GetBranchesByCourseController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-branches-by-course')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getBranchesByCourse(
        @Query() query: GetBranchesByCourseRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getBranchesByCourseAPI(adminId, query);

            const response: GetBranchesByCourseResponse = {
                success: true,
                message: 'Branches fetched successfully',
                data: result,
            };

            return response;

        } catch (error) {
            const response: GetBranchesByCourseResponse = {
                success: false,
                message: error.message || 'Failed to fetch branches by course',
            };
            return response;
        }
    }
}
