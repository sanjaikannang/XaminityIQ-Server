import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { DeleteQuestionResponse } from './delete-question.response';

@Controller('admin')
export class DeleteQuestionController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Delete('exams/:id/questions/:questionId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteQuestion(
        @Param('id') examId: string,
        @Param('questionId') questionId: string,
    ): Promise<DeleteQuestionResponse> {
        await this.examManagementService.deleteQuestionAPI(examId, questionId);

        return {
            success: true,
            message: 'Question deleted successfully',
        };
    }
}
