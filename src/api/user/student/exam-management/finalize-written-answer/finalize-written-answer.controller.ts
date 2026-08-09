import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { FinalizeWrittenAnswerResponse } from './finalize-written-answer.response';

@Controller('student')
export class FinalizeWrittenAnswerController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/attempts/:attemptId/answers/:questionId/finalize')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async finalizeWrittenAnswer(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Param('questionId') questionId: string,
    ): Promise<FinalizeWrittenAnswerResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.examAttemptService.finalizeWrittenAnswerAPI(userId, attemptId, questionId);

        return {
            success: true,
            ...result,
        };
    }
}
