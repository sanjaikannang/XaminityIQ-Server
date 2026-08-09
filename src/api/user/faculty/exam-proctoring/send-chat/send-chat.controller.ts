import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { SendChatRequest } from './send-chat.request';
import { SendChatResponse } from './send-chat.response';

@Controller('faculty')
export class SendChatController {
    constructor(private readonly facultyService: FacultyService) { }

    @Post('exam-rooms/:roomId/chat')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async sendChat(
        @Req() req: Request,
        @Param('roomId') roomId: string,
        @Body() data: SendChatRequest,
    ): Promise<SendChatResponse> {
        const userId = (req as any).user?.sub;
        const chatMessage = await this.facultyService.sendChatAPI(
            userId,
            roomId,
            data.message,
            data.recipientType,
            data.recipientStudentId,
        );

        return {
            success: true,
            message: 'Message sent',
            data: chatMessage,
        };
    }
}
