import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';
import { CheckJoinStatusResponse } from './check-join-status.response';
import { StudentService } from 'src/services/user-service/student/student.service';

@Controller('student/exams')
export class CheckJoinStatusController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Get(':examId/join-request/status')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async checkJoinStatus(
        @Param('examId') examId: string,
        @Query('requestId') requestId: string
    ): Promise<CheckJoinStatusResponse> {
        const result = await this.studentService.checkJoinRequestStatus(requestId);

        return {
            success: true,
            message: `Join request status: ${result.status}`,
            data: result
        };
    }
}