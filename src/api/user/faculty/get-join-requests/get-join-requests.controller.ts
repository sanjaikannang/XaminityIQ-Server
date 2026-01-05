import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/utils/enum';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetJoinRequestsResponse } from './get-join-requests.response';

@Controller('faculty')
export class GetJoinRequestsController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Get('exam/:examId/join-requests')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getJoinRequests(
        @Req() req: any,
        @Param('examId') examId: string
    ): Promise<GetJoinRequestsResponse> {
        const facultyId = req.user.sub;

        const result = await this.facultyService.getPendingJoinRequests(examId, facultyId);

        return {
            success: true,
            message: 'Join requests fetched successfully',
            data: result
        };
    }
}
