import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { ReportViolationRequest } from './report-violation.request';
import { ReportViolationResponse } from './report-violation.response';

@Controller('student')
export class ReportViolationController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/attempts/:attemptId/violations')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async reportViolation(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Body() data: ReportViolationRequest,
    ): Promise<ReportViolationResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.examAttemptService.reportViolationAPI(userId, attemptId, data.type);

        return {
            success: true,
            ...result,
        };
    }
}
