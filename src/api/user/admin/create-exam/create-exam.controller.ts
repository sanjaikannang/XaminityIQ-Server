import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateExamRequest } from './create-exam.request';
import { CreateExamResponse } from './create-exam.response';
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';

@Controller('admin/exams')
export class CreateExamController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createExam(
        @Body() body: CreateExamRequest,
        @Request() req: any
    ): Promise<CreateExamResponse> {
        const result = await this.adminService.createExam({
            ...body,
            adminId: req.user.sub
        });

        return {
            success: true,
            message: 'Exam created successfully',
            data: result
        };
    }
}