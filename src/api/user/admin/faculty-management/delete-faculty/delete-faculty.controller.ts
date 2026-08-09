import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DeleteFacultyResponse } from './delete-faculty.response';
import { Controller, Delete, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { FacultyManagementService } from 'src/services/user-service/admin/faculty-management.service';

@Controller('admin')
export class DeleteFacultyController {
    constructor(private readonly facultyManagementService: FacultyManagementService) { }

    @Delete('faculty/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteFaculty(
        @Param('id') id: string,
    ) {
        try {
            const result = await this.facultyManagementService.deleteFacultyAPI(id);

            const response: DeleteFacultyResponse = {
                success: true,
                message: result.message,
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Failed to delete faculty',
            });
        }
    }
}
