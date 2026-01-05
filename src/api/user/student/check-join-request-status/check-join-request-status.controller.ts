import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { StudentService } from 'src/services/user-service/student/student.service';
import { CheckJoinRequestStatusResponse } from './check-join-request-status.response';

@Controller('student')
export class CheckJoinRequestStatusController {
    constructor(
        private readonly studentService: StudentService
    ) { }

    @Get('exam/request/:requestId/status')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async checkStatus(
        @Req() req: any,
        @Param('requestId') requestId: string
    ): Promise<CheckJoinRequestStatusResponse> {
        const studentId = req.user.sub;

        const result = await this.studentService.checkJoinRequestStatus(
            requestId,
            studentId
        );

        return {
            success: true,
            message: 'Join request status fetched',
            data: result,
        };
    }
}
