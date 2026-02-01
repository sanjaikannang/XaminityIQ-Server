import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetStudentExamsRequest } from './get-student-exams.request';
import { GetStudentExamsResponse } from './get-student-exams.response';
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
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
        @Request() req: any,
        @Query() query: GetStudentExamsRequest,
    ): Promise<GetStudentExamsResponse> {
        const studentId = req.user.sub;
        const exams = await this.studentService.getStudentExams(
            studentId,
            query.status
        );

        return {
            success: true,
            message: exams.length > 0 ? 'Exams fetched successfully' : 'No exams found',
            data: exams
        };
    }
}