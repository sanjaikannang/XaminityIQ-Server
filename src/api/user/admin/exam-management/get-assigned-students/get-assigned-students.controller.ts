import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { GetAssignedStudentsResponse } from './get-assigned-students.response';

@Controller('admin')
export class GetAssignedStudentsController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Get('exams/:id/assigned-students')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAssignedStudents(@Param('id') id: string): Promise<GetAssignedStudentsResponse> {
        const students = await this.examManagementService.getAssignedStudentsAPI(id);

        return {
            success: true,
            message: 'Assigned students fetched successfully',
            data: { students },
        };
    }
}
