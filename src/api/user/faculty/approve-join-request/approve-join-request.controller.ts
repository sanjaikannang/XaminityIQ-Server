import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';
import { ApproveJoinRequestRequest } from './approve-join-request.request';
import { ApproveJoinRequestResponse } from './approve-join-request.response';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty/exams')
export class ApproveJoinRequestController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post(':examId/join-requests/approve')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async approveJoinRequest(
        @Param('examId') examId: string,
        @Body() body: ApproveJoinRequestRequest
    ): Promise<ApproveJoinRequestResponse> {
        await this.facultyService.approveJoinRequest(body.requestId);

        return {
            success: true,
            message: 'Join request approved successfully'
        };
    }
}
