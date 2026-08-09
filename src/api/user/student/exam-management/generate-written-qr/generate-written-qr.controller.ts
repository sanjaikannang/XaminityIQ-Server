import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { GenerateWrittenQrResponse } from './generate-written-qr.response';

@Controller('student')
export class GenerateWrittenQrController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/attempts/:attemptId/answers/:questionId/qr')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async generateWrittenQr(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Param('questionId') questionId: string,
    ): Promise<GenerateWrittenQrResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.examAttemptService.generateWrittenQrAPI(userId, attemptId, questionId);

        return {
            success: true,
            message: 'QR code generated successfully',
            data,
        };
    }
}
