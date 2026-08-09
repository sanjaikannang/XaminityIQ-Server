import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { GetWrittenQrStatusResponse } from './get-written-qr-status.response';

@Controller('student')
export class GetWrittenQrStatusController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Get('exams/attempts/:attemptId/answers/:questionId/qr-status')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getWrittenQrStatus(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Param('questionId') questionId: string,
    ): Promise<GetWrittenQrStatusResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.examAttemptService.getWrittenQrStatusAPI(userId, attemptId, questionId);

        return {
            success: true,
            message: 'QR status fetched successfully',
            data,
        };
    }
}
