import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';
import { StudentJoinRequestRequest } from './student-join-request.request';
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
        @Param('examId') examId: string,
        @Body() body: StudentJoinRequestRequest
    ): Promise<StudentJoinRequestResponse> {

        console.log("Join request body...", body);

        const result = await this.studentService.requestToJoinExam({
            examId,
            ...body
        });

        return {
            success: true,
            message: 'Join request sent successfully',
            data: result
        };
    }
}