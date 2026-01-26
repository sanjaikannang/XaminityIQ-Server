import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';
import { GetChatHistoryResponse } from './get-chat-history.response';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty/exams')
export class GetChatHistoryController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Get(':examId/messages')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getChatHistory(
        @Param('examId') examId: string,
        @Query('recipientId') recipientId?: string
    ): Promise<GetChatHistoryResponse> {
        const messages = await this.facultyService.getChatHistory(examId, recipientId);

        return {
            success: true,
            message: 'Chat history fetched successfully',
            data: messages
        };
    }
}