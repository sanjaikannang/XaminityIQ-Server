import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { EditStudentRequest } from './edit-student.request';
import { EditStudentResponse } from './edit-student.response';
import { Controller, Patch, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { StudentManagementService } from 'src/services/user-service/admin/student-management.service';

@Controller('admin')
export class EditStudentController {
    constructor(private readonly studentManagementService: StudentManagementService) { }

    @Patch('students/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async editStudent(
        @Param('id') id: string,
        @Body() editStudentData: EditStudentRequest,
    ) {
        try {
            await this.studentManagementService.editStudentAPI(id, editStudentData);

            const response: EditStudentResponse = {
                success: true,
                message: 'Student Updated Successfully'
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Failed to update student',
            });
        }
    }
}
