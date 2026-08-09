import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetChatHistoryResponse } from './get-chat-history.response';

@Controller('faculty')
export class GetChatHistoryController {
    constructor(private readonly facultyService: FacultyService) { }

    @Get('exam-rooms/:roomId/chat')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getChatHistory(
        @Req() req: Request,
        @Param('roomId') roomId: string,
    ): Promise<GetChatHistoryResponse> {
        const userId = (req as any).user?.sub;
        const messages = await this.facultyService.getChatHistoryAPI(userId, roomId);

        return {
            success: true,
            message: 'Chat history fetched successfully',
            data: messages,
        };
    }
}
