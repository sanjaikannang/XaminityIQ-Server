import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JoinExamRequest } from './join-exam.request';
import { JoinExamResponse } from './join-exam.response';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, UseGuards, Post, Body, Req } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty')
export class JoinExamController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post('exam/join')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async joinExam(
        @Body() body: JoinExamRequest,
        @Req() req: any
    ): Promise<JoinExamResponse> {
        const facultyId = req.user.sub;

        const result = await this.facultyService.joinExam(
            body.examId,
            facultyId
        );

        return {
            success: true,
            message: "Successfully joined exam room",
            data: result,
        };
    }
}