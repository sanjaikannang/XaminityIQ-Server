import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateStudentRequest } from './create-student.request';
import { CreateStudentResponse } from './create-student.response';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';

@Controller('admin')
export class CreateStudentController {
    constructor(private readonly adminService: AdminService) { }

    @Post('student')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createStudent(
        @Body() createStudentData: CreateStudentRequest,
    ) {
        await this.adminService.createStudentAPI(createStudentData);

        const response: CreateStudentResponse = {
            success: true,
            message: 'Student Created Successfully'
        };

        return response;
    }
}