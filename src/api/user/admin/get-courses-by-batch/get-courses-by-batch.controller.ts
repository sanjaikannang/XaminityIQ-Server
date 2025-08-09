import { Controller, Req, UseGuards, Query, Get } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetCoursesByBatchRequest } from './get-courses-by-batch.request';
import { GetCoursesByBatchResponse } from './get-courses-by-batch.response';


@Controller('admin')
export class GetCoursesByBatchController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-courses-by-batch')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getCoursesByBatch(
        @Query() query: GetCoursesByBatchRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getCoursesByBatchAPI(adminId, query);

            const response: GetCoursesByBatchResponse = {
                success: true,
                message: 'Courses fetched successfully',
                data: result,
            };

            return response;

        } catch (error) {
            const response: GetCoursesByBatchResponse = {
                success: false,
                message: error.message || 'Failed to fetch courses',
            };
            return response;
        }
    }
}
