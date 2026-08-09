import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { RejectStudentRequest } from './reject-student.request';
import { RejectStudentResponse } from './reject-student.response';

@Controller('faculty')
export class RejectStudentController {
    constructor(private readonly facultyService: FacultyService) { }

    @Post('exam-rooms/:roomId/assignments/:assignmentId/reject')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async rejectStudent(
        @Req() req: Request,
        @Param('roomId') roomId: string,
        @Param('assignmentId') assignmentId: string,
        @Body() data: RejectStudentRequest,
    ): Promise<RejectStudentResponse> {
        const userId = (req as any).user?.sub;
        await this.facultyService.rejectStudentAPI(userId, roomId, assignmentId, data.reason);

        return {
            success: true,
            message: 'Student rejected',
        };
    }
}
