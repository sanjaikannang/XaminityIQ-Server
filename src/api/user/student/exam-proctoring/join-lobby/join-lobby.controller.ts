import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { JoinLobbyResponse } from './join-lobby.response';

@Controller('student')
export class JoinLobbyController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exam-rooms/:examId/join')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async joinLobby(
        @Req() req: Request,
        @Param('examId') examId: string,
    ): Promise<JoinLobbyResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.examAttemptService.joinLobbyAPI(userId, examId);

        return {
            success: true,
            message: 'Joined the waiting room successfully',
            data,
        };
    }
}
