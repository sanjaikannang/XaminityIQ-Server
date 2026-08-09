import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { StartAttemptResponse } from './start-attempt.response';

@Controller('student')
export class StartAttemptController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/:examId/start')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async startAttempt(
        @Req() req: Request,
        @Param('examId') examId: string,
    ): Promise<StartAttemptResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.examAttemptService.startAttemptAPI(userId, examId);

        return {
            success: true,
            message: 'Attempt started successfully',
            data,
        };
    }
}
