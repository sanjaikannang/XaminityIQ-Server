// create-faculty.controller.ts
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateFacultyRequest } from './create-faculty.request';
import { CreateFacultyResponse } from './create-faculty.response';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FacultyManagementService } from 'src/services/user-service/admin/faculty-management.service';

@Controller('admin')
export class CreateFacultyController {
    constructor(private readonly facultyManagementService: FacultyManagementService) { }

    @Post('faculty')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createFaculty(
        @Body() createFacultyData: CreateFacultyRequest,
    ): Promise<CreateFacultyResponse> {

        const result = await this.facultyManagementService.createFacultyAPI(createFacultyData);

        const response: CreateFacultyResponse = {
            success: true,
            message: 'Faculty Created Successfully',
        };

        return response;
    }
}