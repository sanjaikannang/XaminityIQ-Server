import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { AddQuestionRequest } from './add-question.request';
import { AddQuestionResponse } from './add-question.response';

@Controller('admin')
export class AddQuestionController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Post('exams/:id/questions')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async addQuestion(
        @Req() req: Request,
        @Param('id') examId: string,
        @Body() data: AddQuestionRequest,
    ): Promise<AddQuestionResponse> {
        const userId = (req as any).user?.sub;
        const question = await this.examManagementService.addQuestionAPI(examId, data, userId);

        return {
            success: true,
            message: 'Question added successfully',
            data: question,
        };
    }
}
