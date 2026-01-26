import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';
import { RemoveStudentRequest } from './remove-student.request';
import { ApproveJoinRequestResponse } from '../approve-join-request/approve-join-request.response';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty/exams')
export class RemoveStudentController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post(':examId/remove-student')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async removeStudent(
        @Param('examId') examId: string,
        @Body() body: RemoveStudentRequest
    ): Promise<ApproveJoinRequestResponse> {
        await this.facultyService.removeStudent(examId, body.studentId, body.reason);

        return {
            success: true,
            message: 'Student removed successfully'
        };
    }
}