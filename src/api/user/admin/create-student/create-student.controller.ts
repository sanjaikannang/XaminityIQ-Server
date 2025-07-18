import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { UserRole } from 'src/utils/enum';
import { CreateStudentRequest } from './create-student.request';
import { CreateStudentResponse } from './create-student.response';
import { AdminService } from 'src/services/user-service/admin/admin.service';

@Controller('admin')
export class CreateStudentController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('student/create')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createStudent(
        @Body() createStudentData: CreateStudentRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.createStudentUserAPI(adminId, createStudentData);

            const response: CreateStudentResponse = {
                success: true,
                message: 'Student created successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to create student',
            })

        }
    }
}
