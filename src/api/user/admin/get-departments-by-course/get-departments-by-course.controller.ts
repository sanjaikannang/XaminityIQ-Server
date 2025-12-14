import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetDepartmentsByCourseResponse } from './get-departments-by-course.response';

@Controller('admin')
export class GetDepartmentsByCourseController {
    constructor(private readonly adminService: AdminService) { }

    @Get('courses/:courseId/departments')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getDepartmentsByCourse(
        @Param('courseId') courseId: string
    ): Promise<GetDepartmentsByCourseResponse> {

        const result = await this.adminService.getDepartmentsByCourseAPI(courseId);

        const response: GetDepartmentsByCourseResponse = {
            success: true,
            message: 'Departments Fetched Successfully',
            data: result
        };

        return response;
    }
}