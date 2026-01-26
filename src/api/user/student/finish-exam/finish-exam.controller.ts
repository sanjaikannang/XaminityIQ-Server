import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';
import { FinishExamRequest } from './finish-exam.request';
import { FinishExamResponse } from './finish-exam.response';
import { StudentService } from 'src/services/user-service/student/student.service';

@Controller('student/exams')
export class FinishExamController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Post(':examId/finish')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async finishExam(
        @Param('examId') examId: string,
        @Body() body: FinishExamRequest
    ): Promise<FinishExamResponse> {
        const result = await this.studentService.finishExam(examId, body.studentId);

        return {
            success: true,
            message: 'Exam finished successfully',
            data: {
                duration: result.duration,
                timestamp: result.timestamp
            }
        };
    }
}