import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { RecordingSignatureRequest } from './recording-signature.request';
import { RecordingSignatureResponse } from './recording-signature.response';

@Controller('student')
export class RecordingSignatureController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/attempts/:attemptId/recordings/signature')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getSignature(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Body() data: RecordingSignatureRequest,
    ): Promise<RecordingSignatureResponse> {
        const userId = (req as any).user?.sub;
        const signature = await this.examAttemptService.getUploadSignatureAPI(
            userId,
            attemptId,
            data.mediaType,
            data.sequence,
        );

        return {
            success: true,
            message: 'Signature generated successfully',
            data: signature,
        };
    }
}
