import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RejectJoinRequestRequest } from './reject-join-request.request';
import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { ApproveJoinRequestResponse } from '../approve-join-request/approve-join-request.response';

@Controller('faculty/exams')
export class RejectJoinRequestController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post(':examId/join-requests/reject')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async rejectJoinRequest(
        @Param('examId') examId: string,
        @Body() body: RejectJoinRequestRequest
    ): Promise<ApproveJoinRequestResponse> {
        await this.facultyService.rejectJoinRequest(body.requestId, body.reason);

        return {
            success: true,
            message: 'Join request rejected successfully'
        };
    }
}