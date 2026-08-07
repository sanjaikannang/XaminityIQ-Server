import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { EditFacultyRequest } from './edit-faculty.request';
import { EditFacultyResponse } from './edit-faculty.response';
import { Controller, Patch, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { FacultyManagementService } from 'src/services/user-service/admin/faculty-management.service';

@Controller('admin')
export class EditFacultyController {
    constructor(private readonly facultyManagementService: FacultyManagementService) { }

    @Patch('faculty/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async editFaculty(
        @Param('id') id: string,
        @Body() editFacultyData: EditFacultyRequest,
    ) {
        try {
            await this.facultyManagementService.editFacultyAPI(id, editFacultyData);

            const response: EditFacultyResponse = {
                success: true,
                message: 'Faculty Updated Successfully'
            };

            return response;

        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error.message || 'Failed to update faculty',
            });
        }
    }
}
