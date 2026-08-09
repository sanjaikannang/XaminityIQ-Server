import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetFacultyActivityResponse } from './get-faculty-activity.response';
import { Controller, Get, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { FacultyManagementService } from 'src/services/user-service/admin/faculty-management.service';

@Controller('admin')
export class GetFacultyActivityController {
    constructor(private readonly facultyManagementService: FacultyManagementService) { }

    @Get('faculty/:id/activity')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getFacultyActivity(
        @Param('id') id: string,
    ): Promise<GetFacultyActivityResponse> {
        try {
            const activity = await this.facultyManagementService.getFacultyActivityAPI(id);

            return {
                success: true,
                message: 'Faculty Activity Fetched Successfully',
                data: activity,
            };

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Failed to fetch faculty activity',
            });
        }
    }
}
