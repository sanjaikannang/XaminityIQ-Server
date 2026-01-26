import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';
import { FacultyJoinExamRequest } from './faculty-join-exam.request';
import { FacultyJoinExamResponse } from './faculty-join-exam.response';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty/exams')
export class FacultyJoinExamController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post(':examId/faculty-join')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async facultyJoinExam(
        @Param('examId') examId: string,
        @Body() body: FacultyJoinExamRequest
    ): Promise<FacultyJoinExamResponse> {
        const result = await this.facultyService.facultyJoinExam(examId, body.facultyId);

        return {
            success: true,
            message: 'Joined exam successfully',
            data: result
        };
    }
}
