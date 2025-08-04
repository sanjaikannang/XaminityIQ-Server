import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { CreateExamRequest } from './create-exam.request';
import { CreateExamResponse } from './create-exam.response';

@Controller('admin')
export class CreateExamController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('create-exam')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createExam(
        @Body() createExamData: CreateExamRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.createExamAPI(adminId, createExamData);

            const response: CreateExamResponse = {
                success: true,
                message: 'Exam created successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to create exam',
            });

        }
    }
}
