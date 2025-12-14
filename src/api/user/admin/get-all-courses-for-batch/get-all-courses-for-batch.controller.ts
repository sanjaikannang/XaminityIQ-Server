import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetAllCoursesForBatchRequest } from './get-all-courses-for-batch.request';
import { GetAllCoursesForBatchResponse } from './get-all-courses-for-batch.response';

@Controller('admin')
export class GetAllCoursesForBatchController {
    constructor(private readonly adminService: AdminService) { }

    @Get('batches/:batchId/courses')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllCourseForBatch(
        @Param('batchId') batchId: string,
        @Query() query: GetAllCoursesForBatchRequest
    ): Promise<GetAllCoursesForBatchResponse> {

        const result = await this.adminService.getAllCoursesForBatchAPI(batchId, query);

        const response: GetAllCoursesForBatchResponse = {
            success: true,
            message: 'Courses Fetched Successfully',
            data: result.courses,
            pagination: result.pagination
        };

        return response;
    }
}