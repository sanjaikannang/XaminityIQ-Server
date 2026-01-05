import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RejectJoinRequest } from './reject-join-request.request';
import { RejectJoinRequestResponse } from './reject-join-request.response';
import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty')
export class RejectJoinRequestController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post('exam/request/:requestId/reject')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async reject(
        @Req() req: any,
        @Param('requestId') requestId: string,
        @Body() body: RejectJoinRequest
    ): Promise<RejectJoinRequestResponse> {
        const facultyId = req.user.sub;

        const result = await this.facultyService.rejectJoinRequest(
            requestId,
            facultyId,
            body.reason
        );

        return {
            success: true,
            message: 'Join request rejected',
            data: result
        };
    }
}
