import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { AddDepartmentToBatchCourseRequest } from './add-department-to-batch-course.request';
import { AddDepartmentToBatchCourseResponse } from './add-department-to-batch-course.response';

@Controller('admin')
export class AddDepartmentToBatchCourseController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('batch-courses/:batchCourseId/departments')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async addDepartmentToBatchCourse(
        @Param('batchCourseId') batchCourseId: string,
        @Body() addDeptData: AddDepartmentToBatchCourseRequest,
    ): Promise<AddDepartmentToBatchCourseResponse> {
        const batchDeptId = await this.adminService.addDepartmentToBatchCourseAPI(batchCourseId, addDeptData);

        return {
            message: 'Department added successfully',
            batchDeptId
        };
    }
}