import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DeleteStudentResponse } from './delete-student.response';
import { Controller, Delete, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { StudentManagementService } from 'src/services/user-service/admin/student-management.service';

@Controller('admin')
export class DeleteStudentController {
    constructor(private readonly studentManagementService: StudentManagementService) { }

    @Delete('students/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteStudent(
        @Param('id') id: string,
    ) {
        try {
            const result = await this.studentManagementService.deleteStudentAPI(id);

            const response: DeleteStudentResponse = {
                success: true,
                message: result.message,
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Failed to delete student',
            });
        }
    }
}
