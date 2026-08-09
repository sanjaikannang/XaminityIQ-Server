import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetMyExamRoomsResponse } from './get-my-exam-rooms.response';

@Controller('faculty')
export class GetMyExamRoomsController {
    constructor(private readonly facultyService: FacultyService) { }

    @Get('exam-rooms')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getMyExamRooms(@Req() req: Request): Promise<GetMyExamRoomsResponse> {
        const userId = (req as any).user?.sub;
        const data = await this.facultyService.getMyExamRoomsAPI(userId);

        return {
            success: true,
            message: 'Exam rooms fetched successfully',
            data,
        };
    }
}
