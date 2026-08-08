import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { GetAttemptResponse } from './get-attempt.response';

@Controller('student')
export class GetAttemptController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Get('exams/attempts/:attemptId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getAttempt(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
    ): Promise<GetAttemptResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.examAttemptService.getAttemptAPI(userId, attemptId);

        return {
            success: true,
            message: 'Attempt fetched successfully',
            data,
        };
    }
}
