import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { GetLiveKitTokenResponse } from './get-livekit-token.response';

@Controller('student')
export class GetLiveKitTokenController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/attempts/:attemptId/livekit-token')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getLiveKitToken(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
    ): Promise<GetLiveKitTokenResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.examAttemptService.getLiveKitTokenAPI(userId, attemptId);

        return {
            success: true,
            message: 'LiveKit token issued successfully',
            data,
        };
    }
}
