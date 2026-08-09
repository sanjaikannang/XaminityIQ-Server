import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { GetMyResultResponse } from './get-my-result.response';

@Controller('student')
export class GetMyResultController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Get('exams/attempts/:attemptId/result')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getMyResult(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
    ): Promise<GetMyResultResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.examAttemptService.getMyResultAPI(userId, attemptId);

        return {
            success: true,
            message: 'Result fetched successfully',
            data,
        };
    }
}
