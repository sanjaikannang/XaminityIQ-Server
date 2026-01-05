import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RequestJoinExamResponse } from './request-join-exam.response';
import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { StudentService } from 'src/services/user-service/student/student.service';

@Controller('student')
export class RequestJoinExamController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Post('exam/:examId/request-join')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async requestJoin(
        @Req() req: any,
        @Param('examId') examId: string
    ): Promise<RequestJoinExamResponse> {
        const studentId = req.user.sub;

        const result = await this.studentService.requestJoinExam(examId, studentId);

        return {
            success: true,
            message: result.message,
            data: result,
        };
    }
}
