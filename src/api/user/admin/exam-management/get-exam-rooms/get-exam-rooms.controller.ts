import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { GetExamRoomsResponse } from './get-exam-rooms.response';

@Controller('admin')
export class GetExamRoomsController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Get('exams/:id/rooms')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getExamRooms(@Param('id') id: string): Promise<GetExamRoomsResponse> {
        const rooms = await this.examManagementService.getExamRoomsAPI(id);

        return {
            success: true,
            message: 'Exam rooms fetched successfully',
            data: { rooms },
        };
    }
}
