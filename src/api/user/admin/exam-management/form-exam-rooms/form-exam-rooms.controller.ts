import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { FormExamRoomsResponse } from './form-exam-rooms.response';

@Controller('admin')
export class FormExamRoomsController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Post('exams/:id/rooms')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async formExamRooms(@Param('id') id: string): Promise<FormExamRoomsResponse> {
        const rooms = await this.examManagementService.formExamRoomsAPI(id);

        return {
            success: true,
            message: 'Exam rooms formed successfully',
            data: { rooms },
        };
    }
}
