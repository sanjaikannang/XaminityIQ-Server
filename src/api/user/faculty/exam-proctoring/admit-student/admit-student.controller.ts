import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { AdmitStudentResponse } from './admit-student.response';

@Controller('faculty')
export class AdmitStudentController {
    constructor(private readonly facultyService: FacultyService) { }

    @Post('exam-rooms/:roomId/assignments/:assignmentId/admit')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async admitStudent(
        @Req() req: Request,
        @Param('roomId') roomId: string,
        @Param('assignmentId') assignmentId: string,
    ): Promise<AdmitStudentResponse> {
        const userId = (req as any).user?.sub;
        const result = await this.facultyService.admitStudentAPI(userId, roomId, assignmentId);

        return {
            success: true,
            ...result,
        };
    }
}
