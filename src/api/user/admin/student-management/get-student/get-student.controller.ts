import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { GetStudentResponse } from './get-student.response';
import { StudentManagementService } from 'src/services/user-service/admin/student-management.service';

@Controller('admin')
export class GetStudentController {
    constructor(private readonly studentManagementService: StudentManagementService) { }

    @Get('students/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getStudent(
        @Param('id') id: string
    ): Promise<GetStudentResponse> {

        const student = await this.studentManagementService.getStudentByIdAPI(id);

        const response: GetStudentResponse = {
            success: true,
            message: 'Student Fetched Successfully',
            data: student
        };

        return response;
    }
}