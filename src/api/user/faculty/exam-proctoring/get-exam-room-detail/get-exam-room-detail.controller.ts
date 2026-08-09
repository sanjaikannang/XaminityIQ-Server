import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetExamRoomDetailResponse } from './get-exam-room-detail.response';

@Controller('faculty')
export class GetExamRoomDetailController {
    constructor(private readonly facultyService: FacultyService) { }

    @Get('exam-rooms/:roomId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getExamRoomDetail(
        @Req() req: Request,
        @Param('roomId') roomId: string,
    ): Promise<GetExamRoomDetailResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.facultyService.getExamRoomDetailAPI(userId, roomId);

        return {
            success: true,
            message: 'Exam room detail fetched successfully',
            data,
        };
    }
}
