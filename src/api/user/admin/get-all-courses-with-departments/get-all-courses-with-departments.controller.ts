import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetAllCoursesWithDepartmentsResponse } from './get-all-courses-with-departments.response';
import { GetAllCoursesWithDepartmentsRequest } from './get-all-courses-with-departments.request';

@Controller('admin')
export class GetAllCoursesWithDepartmentsController {
    constructor(private readonly adminService: AdminService) { }

    @Get('courses-with-departments')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllCoursesWithDepartments(
        @Query() query: GetAllCoursesWithDepartmentsRequest
    ): Promise<GetAllCoursesWithDepartmentsResponse> {

        const result = await this.adminService.getAllCoursesWithDepartmentsAPI(query);

        const response: GetAllCoursesWithDepartmentsResponse = {
            success: true,
            message: 'Courses with Departments Fetched Successfully',
            data: result.data,
            pagination: result.pagination
        };

        return response;
    }
}