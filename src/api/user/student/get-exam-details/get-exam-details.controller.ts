import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetExamDetailsResponse } from './get-exam-details.response';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { StudentService } from 'src/services/user-service/student/student.service';

@Controller('student')
export class GetExamDetailsController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Get('exam/:examId/details')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getDetails(
        @Req() req: any,
        @Param('examId') examId: string
    ): Promise<GetExamDetailsResponse> {
        const studentId = req.user.sub;

        const result = await this.studentService.getExamDetails(examId, studentId);

        return {
            success: true,
            message: 'Exam details fetched successfully',
            data: result,
        };
    }
}
