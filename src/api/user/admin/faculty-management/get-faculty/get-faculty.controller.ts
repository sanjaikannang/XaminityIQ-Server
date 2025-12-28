import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetFacultyResponse } from './get-faculty.response';
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { FacultyManagementService } from 'src/services/user-service/admin/faculty-management.service';

@Controller('admin')
export class GetFacultyController {
    constructor(private readonly facultyManagementService: FacultyManagementService) { }

    @Get('faculty/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getFaculty(
        @Param('id') id: string
    ): Promise<GetFacultyResponse> {

        const faculty = await this.facultyManagementService.getFacultyByIdAPI(id);

        const response: GetFacultyResponse = {
            success: true,
            message: 'Faculty Fetched Successfully',
            data: faculty
        };

        return response;
    }
}