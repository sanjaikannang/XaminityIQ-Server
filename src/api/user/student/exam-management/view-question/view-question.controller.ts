import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { ViewQuestionResponse } from './view-question.response';

@Controller('student')
export class ViewQuestionController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/attempts/:attemptId/questions/:questionId/view')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async viewQuestion(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Param('questionId') questionId: string,
    ): Promise<ViewQuestionResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.examAttemptService.viewQuestionAPI(userId, attemptId, questionId);

        return {
            success: true,
            message: 'Question view recorded',
            data,
        };
    }
}
