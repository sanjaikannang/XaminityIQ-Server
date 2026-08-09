import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetLiveKitTokenResponse } from './get-livekit-token.response';

@Controller('faculty')
export class GetLiveKitTokenController {
    constructor(private readonly facultyService: FacultyService) { }

    @Post('exam-rooms/:roomId/livekit-token')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getLiveKitToken(
        @Req() req: Request,
        @Param('roomId') roomId: string,
    ): Promise<GetLiveKitTokenResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.facultyService.getLiveKitTokenAPI(userId, roomId);

        return {
            success: true,
            message: 'LiveKit token issued successfully',
            data,
        };
    }
}
