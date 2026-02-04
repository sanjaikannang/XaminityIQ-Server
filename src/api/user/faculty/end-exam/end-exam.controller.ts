import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { ApproveJoinRequestResponse } from '../approve-join-request/approve-join-request.response';

@Controller('faculty/exams')
export class EndExamController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post(':examId/end')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async endExam(
        @Param('examId') examId: string
    ): Promise<ApproveJoinRequestResponse> {
        await this.facultyService.endExam(examId);

        return {
            success: true,
            message: 'Exam ended successfully'
        };
    }
}
