import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetStudentActivityResponse } from './get-student-activity.response';
import { Controller, Get, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { StudentManagementService } from 'src/services/user-service/admin/student-management.service';

@Controller('admin')
export class GetStudentActivityController {
    constructor(private readonly studentManagementService: StudentManagementService) { }

    @Get('students/:id/activity')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getStudentActivity(
        @Param('id') id: string,
    ): Promise<GetStudentActivityResponse> {
        try {
            const activity = await this.studentManagementService.getStudentActivityAPI(id);

            return {
                success: true,
                message: 'Student Activity Fetched Successfully',
                data: activity,
            };

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Failed to fetch student activity',
            });
        }
    }
}
