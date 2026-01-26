import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ExamStatus, UserRole } from 'src/utils/enum';
import { StudentService } from 'src/services/user-service/student/student.service';

@Controller('student/exams')
export class GetStudentExamsController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Get('my-exams')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async getStudentExams(
        @Query('studentId') studentId: string,
        @Query('status') status?: ExamStatus
    ) {
        const exams = await this.studentService.getStudentExams(studentId, status);

        return {
            success: true,
            message: exams.length > 0 ? 'Exams fetched successfully' : 'No exams found',
            data: exams
        };
    }
}