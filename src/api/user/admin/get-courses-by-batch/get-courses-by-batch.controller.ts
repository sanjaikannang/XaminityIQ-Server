import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetCoursesByBatchResponse } from './get-courses-by-batch.response';

@Controller('admin')
export class GetCoursesByBatchController {
    constructor(private readonly adminService: AdminService) { }

    @Get('batches/:batchId/available-courses')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getCoursesByBatch(
        @Param('batchId') batchId: string
    ): Promise<GetCoursesByBatchResponse> {

        const result = await this.adminService.getCoursesByBatchAPI(batchId);

        const response: GetCoursesByBatchResponse = {
            success: true,
            message: 'Available Courses Fetched Successfully',
            data: result
        };

        return response;
    }
}