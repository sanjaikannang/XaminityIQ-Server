import { Controller, Req, UseGuards, Get } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetCoursesResponse } from './get-courses.response';


@Controller('admin')
export class GetCoursesController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-courses')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getCourses(
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getCoursesAPI(adminId);

            const response: GetCoursesResponse = {
                success: true,
                message: 'Courses fetched successfully',
                data: result,
            };

            return response;

        } catch (error) {
            const response: GetCoursesResponse = {
                success: false,
                message: error.message || 'Failed to fetch courses',
            };
            return response;
        }
    }
}
