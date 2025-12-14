import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetAllDepartmentForBatchCourseRequest } from './get-all-departments-for-batch-course.request';
import { GetAllDepartmentForBatchCourseResponse } from './get-all-departments-for-batch-course.response';

@Controller('admin')
export class GetAllDepartmentForBatchCourseController {
    constructor(private readonly adminService: AdminService) { }

    @Get('batch-courses/:batchCourseId/departments')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllDepartmentForBatchCourse(
        @Param('batchCourseId') batchCourseId: string,
        @Query() query: GetAllDepartmentForBatchCourseRequest
    ): Promise<GetAllDepartmentForBatchCourseResponse> {

        const result = await this.adminService.getAllDepartmentsForBatchCourseAPI(batchCourseId, query);

        const response: GetAllDepartmentForBatchCourseResponse = {
            success: true,
            message: 'Departments Fetched Successfully',
            data: result.departments,
            pagination: result.pagination
        };

        return response;
    }
}