import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { SendChatRequest } from './send-chat.request';
import { SendChatResponse } from './send-chat.response';

@Controller('student')
export class SendChatController {
    constructor(private readonly examAttemptService: ExamAttemptService) { }

    @Post('exam-rooms/:roomId/chat')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async sendChat(
        @Req() req: Request,
        @Param('roomId') roomId: string,
        @Body() data: SendChatRequest,
    ): Promise<SendChatResponse> {
        const userId = (req as any).user?.sub;
        const chatMessage = await this.examAttemptService.sendChatAPI(userId, roomId, data.message);

        return {
            success: true,
            message: 'Message sent',
            data: chatMessage,
        };
    }
}
