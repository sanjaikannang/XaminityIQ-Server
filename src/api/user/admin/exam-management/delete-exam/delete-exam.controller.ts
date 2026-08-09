import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { DeleteExamResponse } from './delete-exam.response';

@Controller('admin')
export class DeleteExamController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Delete('exams/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteExam(@Param('id') id: string): Promise<DeleteExamResponse> {
        await this.examManagementService.cancelExamAPI(id);

        return {
            success: true,
            message: 'Exam cancelled successfully',
        };
    }
}
