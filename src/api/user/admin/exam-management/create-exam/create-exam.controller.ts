import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { CreateExamRequest } from './create-exam.request';
import { CreateExamResponse } from './create-exam.response';

@Controller('admin')
export class CreateExamController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Post('exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createExam(
        @Req() req: Request,
        @Body() data: CreateExamRequest,
    ): Promise<CreateExamResponse> {
        const userId = (req as any).user?.sub;
        const exam = await this.examManagementService.createExamAPI(data, userId);

        return {
            success: true,
            message: 'Exam created successfully',
            examId: (exam._id as any).toString(),
        };
    }
}
