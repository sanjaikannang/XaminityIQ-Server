import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { RecordChunkRequest } from './record-chunk.request';
import { RecordChunkResponse } from './record-chunk.response';

@Controller('student')
export class RecordChunkController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exams/attempts/:attemptId/recordings/chunk')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async recordChunk(
        @Req() req: Request,
        @Param('attemptId') attemptId: string,
        @Body() data: RecordChunkRequest,
    ): Promise<RecordChunkResponse> {
        const userId = (req as any).user?.sub;
        await this.examAttemptService.recordChunkAPI(
            userId,
            attemptId,
            data.mediaType,
            data.sequence,
            data.cloudinaryAssetId,
            data.cloudinaryUrl,
        );

        return {
            success: true,
            message: 'Chunk recorded successfully',
        };
    }
}
