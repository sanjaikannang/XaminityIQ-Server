import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JoinExamRequest } from './join-exam.request';
import { JoinExamResponse } from './join-exam.response';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, UseGuards, Post, Body, Req } from '@nestjs/common';
import { StudentService } from 'src/services/user-service/student/student.service';

@Controller('student')
export class JoinExamController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Post('exam/join')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async joinExam(
        @Body() body: JoinExamRequest,
        @Req() req: any
    ): Promise<JoinExamResponse> {
        const studentId = req.user.sub;

        const result = await this.studentService.joinExam(
            body.examId,
            studentId
        );

        return {
            success: true,
            message: "Successfully joined exam room",
            data: result,
        };
    }
}