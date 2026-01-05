import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApproveJoinRequestResponse } from './approve-join-request.response';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';

@Controller('faculty')
export class ApproveJoinRequestController {
    constructor(
        private readonly facultyService: FacultyService
    ) { }

    @Post('exam/request/:requestId/approve')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async approve(
        @Req() req: any,
        @Param('requestId') requestId: string
    ): Promise<ApproveJoinRequestResponse> {
        const facultyId = req.user.sub;

        const result = await this.facultyService.approveJoinRequest(requestId, facultyId);

        return {
            success: true,
            message: 'Join request approved',
            data: result
        };
    }
}
