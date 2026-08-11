import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { SetStudentMicRequest } from './set-student-mic.request';
import { SetStudentMicResponse } from './set-student-mic.response';

@Controller('faculty')
export class SetStudentMicController {
    constructor(private readonly facultyService: FacultyService) { }

    @Post('exam-rooms/:roomId/assignments/:assignmentId/mic')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async setStudentMic(
        @Req() req: Request,
        @Param('roomId') roomId: string,
        @Param('assignmentId') assignmentId: string,
        @Body() data: SetStudentMicRequest,
    ): Promise<SetStudentMicResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.facultyService.setStudentMicMutedAPI(userId, roomId, assignmentId, data.muted);

        return {
            success: true,
            message: result.message,
            data: { muted: result.muted },
        };
    }
}
