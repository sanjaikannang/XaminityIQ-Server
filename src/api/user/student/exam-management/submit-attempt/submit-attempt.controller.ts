import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { SubmitAttemptRequest } from './submit-attempt.request';
import { SubmitAttemptResponse } from './submit-attempt.response';

@Controller('student')
export class SubmitAttemptController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/attempts/:attemptId/submit')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async submitAttempt(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Body() data: SubmitAttemptRequest,
    ): Promise<SubmitAttemptResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.examAttemptService.submitAttemptAPI(userId, attemptId, data.trigger);

        return {
            success: true,
            ...result,
        };
    }
}
