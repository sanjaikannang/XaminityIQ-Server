import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetAllCoursesWithDepartmentsResponse } from './get-all-courses-with-departments.response';

@Controller('admin')
export class GetAllCoursesWithDepartmentsController {
    constructor(private readonly adminService: AdminService) { }

    @Get('courses-with-departments')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllCoursesWithDepartments(): Promise<GetAllCoursesWithDepartmentsResponse> {

        const result = await this.adminService.getAllCoursesWithDepartmentsAPI();

        const response: GetAllCoursesWithDepartmentsResponse = {
            success: true,
            message: 'Courses with Departments Fetched Successfully',
            data: result
        };

        return response;
    }
}