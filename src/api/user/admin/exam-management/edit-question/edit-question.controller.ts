import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { EditQuestionRequest } from './edit-question.request';
import { EditQuestionResponse } from './edit-question.response';

@Controller('admin')
export class EditQuestionController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Patch('exams/:id/questions/:questionId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async editQuestion(
        @Req() req: Request,
        @Param('id') examId: string,
        @Param('questionId') questionId: string,
        @Body() data: EditQuestionRequest,
    ): Promise<EditQuestionResponse> {
        const userId = (req as any).user?.sub;
        await this.examManagementService.editQuestionAPI(examId, questionId, data, userId);

        return {
            success: true,
            message: 'Question updated successfully',
        };
    }
}
