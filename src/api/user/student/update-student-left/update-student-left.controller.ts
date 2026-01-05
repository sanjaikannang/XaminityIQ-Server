import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { StudentService } from 'src/services/user-service/student/student.service';
import { UpdateStudentLeftResponse } from './update-student-left.response';

@Controller('student')
export class UpdateStudentLeftController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Post('exam/:examId/left')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async updateLeftStatus(
        @Req() req: any,
        @Param('examId') examId: string
    ): Promise<UpdateStudentLeftResponse> {
        const studentId = req.user.sub;

        await this.studentService.updateStudentLeftStatus(examId, studentId);

        return {
            success: true,
            message: 'Student left status updated',
        };
    }
}
