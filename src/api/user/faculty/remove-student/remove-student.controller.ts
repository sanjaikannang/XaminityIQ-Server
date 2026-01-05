import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RemoveStudentRequest } from './remove-student.request';
import { RemoveStudentResponse } from './remove-student.response';
import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty')
export class RemoveStudentController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post('exam/:examId/remove-student')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async removeStudent(
        @Req() req: any,
        @Param('examId') examId: string,
        @Body() body: RemoveStudentRequest
    ): Promise<RemoveStudentResponse> {
        const facultyId = req.user.sub;

        const result = await this.facultyService.removeStudent(
            examId,
            body.studentId,
            facultyId,
            body.reason
        );

        return {
            success: true,
            message: 'Student removed from exam',
            data: result
        };
    }
}
