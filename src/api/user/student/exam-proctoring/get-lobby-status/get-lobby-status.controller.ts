import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { GetLobbyStatusResponse } from './get-lobby-status.response';

@Controller('student')
export class GetLobbyStatusController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Get('exam-rooms/lobby/:assignmentId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getLobbyStatus(
        @Req() req: Request,
        @Param('assignmentId') assignmentId: string,
    ): Promise<GetLobbyStatusResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.examAttemptService.getLobbyStatusAPI(userId, assignmentId);

        return {
            success: true,
            message: 'Lobby status fetched successfully',
            data,
        };
    }
}
