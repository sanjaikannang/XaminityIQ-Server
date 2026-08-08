import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { SaveAnswerRequest } from './save-answer.request';
import { SaveAnswerResponse } from './save-answer.response';

@Controller('student')
export class SaveAnswerController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Patch('exams/attempts/:attemptId/answers/:questionId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async saveAnswer(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Param('questionId') questionId: string,
        @Body() data: SaveAnswerRequest,
    ): Promise<SaveAnswerResponse> {
        const userId = (req as any).user?.sub;
        await this.examAttemptService.saveAnswerAPI(userId, attemptId, questionId, data);

        return {
            success: true,
            message: 'Answer saved successfully',
        };
    }
}
