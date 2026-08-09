import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { FinalizeRecordingRequest } from './finalize-recording.request';
import { FinalizeRecordingResponse } from './finalize-recording.response';

@Controller('student')
export class FinalizeRecordingController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/attempts/:attemptId/recordings/finalize')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async finalizeRecording(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Body() data: FinalizeRecordingRequest,
    ): Promise<FinalizeRecordingResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.examAttemptService.finalizeRecordingAPI(userId, attemptId, data.mediaType);

        return {
            success: true,
            ...result,
        };
    }
}
