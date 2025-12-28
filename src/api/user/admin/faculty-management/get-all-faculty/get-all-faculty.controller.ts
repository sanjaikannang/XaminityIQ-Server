import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { GetAllFacultyRequest } from './get-all-faculty.request';
import { GetAllFacultyResponse } from './get-all-faculty.response';
import { FacultyManagementService } from 'src/services/user-service/admin/faculty-management.service';

@Controller('admin')
export class GetAllFacultyController {
    constructor(private readonly facultyManagementService: FacultyManagementService) { }

    @Get('faculty')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllFaculty(
        @Query() query: GetAllFacultyRequest
    ): Promise<GetAllFacultyResponse> {

        const result = await this.facultyManagementService.getAllFacultyAPI(query);

        const response: GetAllFacultyResponse = {
            success: true,
            message: result.faculty.length > 0
                ? 'Faculty Fetched Successfully'
                : 'No faculty found',
            data: result.faculty,
            pagination: result.pagination
        };

        return response;
    }
}