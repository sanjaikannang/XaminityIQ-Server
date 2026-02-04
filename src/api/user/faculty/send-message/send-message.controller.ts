import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { SendMessageRequest } from './send-message.request';
import { SendMessageResponse } from './send-message.response';
import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('exams')
export class SendMessageController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post(':examId/messages')
    @UseGuards(JwtAuthGuard)
    async sendMessage(
        @Param('examId') examId: string,
        @Body() body: SendMessageRequest
    ): Promise<SendMessageResponse> {
        const result = await this.facultyService.sendMessage({
            examId,
            ...body
        });

        return {
            success: true,
            message: 'Message sent successfully',
            data: result
        };
    }
}