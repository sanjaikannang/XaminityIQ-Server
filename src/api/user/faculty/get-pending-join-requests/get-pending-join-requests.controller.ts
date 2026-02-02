import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetPendingJoinRequestsResponse } from './get-pending-join-requests.response';

@Controller('faculty/exams')
export class GetPendingJoinRequestsController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Get(':examId/join-requests/pending')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getPendingJoinRequests(
        @Param('examId') examId: string
    ): Promise<GetPendingJoinRequestsResponse> {
        const requests = await this.facultyService.getPendingJoinRequests(examId);

        return {
            success: true,
            message: requests.length > 0 ? 'Join requests fetched' : 'No pending requests',
            data: requests
        };
    }
}