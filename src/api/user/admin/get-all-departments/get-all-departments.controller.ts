import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetAllDepartmentsResponse } from './get-all-departments.response';

@Controller('admin')
export class GetAllDepartmentsController {
    constructor(private readonly adminService: AdminService) { }

    @Get('departments')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllDepartments(): Promise<GetAllDepartmentsResponse> {

        const result = await this.adminService.getAllDepartmentsAPI();

        const response: GetAllDepartmentsResponse = {
            success: true,
            message: 'Departments Fetched Successfully',
            data: result
        };

        return response;
    }
}
