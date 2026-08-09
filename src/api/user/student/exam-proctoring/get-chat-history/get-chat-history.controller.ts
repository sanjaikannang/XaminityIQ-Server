import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { GetChatHistoryResponse } from './get-chat-history.response';

@Controller('student')
export class GetChatHistoryController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Get('exam-rooms/:roomId/chat')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getChatHistory(
        @Req() req: Request,
        @Param('roomId') roomId: string,
    ): Promise<GetChatHistoryResponse> {
        const userId = (req as any).user?.sub;
        const messages = await this.examAttemptService.getChatHistoryAPI(userId, roomId);

        return {
            success: true,
            message: 'Chat history fetched successfully',
            data: messages,
        };
    }
}
