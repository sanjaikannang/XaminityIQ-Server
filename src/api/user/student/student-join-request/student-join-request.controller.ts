import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { StudentJoinRequestResponse } from './student-join-request.response';
import { StudentService } from 'src/services/user-service/student/student.service';

@Controller('student/exams')
export class StudentJoinRequestController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Post(':examId/join-request')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async studentJoinRequest(
        @Request() req: any,
        @Param('examId') examId: string,
    ): Promise<StudentJoinRequestResponse> {
        const studentId = req.user.sub;

        const result = await this.studentService.requestToJoinExam({
            examId,
            studentId
        });

        return {
            success: true,
            message: 'Join request sent successfully',
            data: result
        };
    }
}