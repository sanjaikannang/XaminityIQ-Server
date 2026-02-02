import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { FacultyJoinExamResponse } from './faculty-join-exam.response';
import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
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
        @Request() req: any,
        @Param('examId') examId: string,
    ): Promise<FacultyJoinExamResponse> {
        const facultyId = req.user.sub;
        const result = await this.facultyService.facultyJoinExam(
            facultyId,
            examId
        );

        return {
            success: true,
            message: 'Joined exam successfully',
            data: result
        };
    }
}
