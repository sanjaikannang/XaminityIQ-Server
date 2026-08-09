import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { RemoveStudentRequest } from './remove-student.request';
import { RemoveStudentResponse } from './remove-student.response';

@Controller('faculty')
export class RemoveStudentController {
    constructor(private readonly facultyService: FacultyService) { }

    @Post('exam-rooms/:roomId/assignments/:assignmentId/remove')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async removeStudent(
        @Req() req: Request,
        @Param('roomId') roomId: string,
        @Param('assignmentId') assignmentId: string,
        @Body() data: RemoveStudentRequest,
    ): Promise<RemoveStudentResponse> {
        const userId = (req as any).user?.sub;
        await this.facultyService.removeStudentAPI(userId, roomId, assignmentId, data.reason);

        return {
            success: true,
            message: 'Student removed',
        };
    }
}
