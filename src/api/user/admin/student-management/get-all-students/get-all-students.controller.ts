import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { GetAllStudentsRequest } from './get-all-students.request';
import { GetAllStudentsResponse } from './get-all-students.response';
import { StudentManagementService } from 'src/services/user-service/admin/student-management.service';

@Controller('admin')
export class GetAllStudentsController {
    constructor(private readonly studentManagementService: StudentManagementService) { }

    @Get('students')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllStudents(
        @Query() query: GetAllStudentsRequest
    ): Promise<GetAllStudentsResponse> {

        const result = await this.studentManagementService.getAllStudentsAPI(query);

        const response: GetAllStudentsResponse = {
            success: true,
            message: result.students.length > 0
                ? 'Students Fetched Successfully'
                : 'No students found',
            data: result.students,
            pagination: result.pagination
        };

        return response;
    }
}