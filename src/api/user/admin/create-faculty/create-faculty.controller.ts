import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CreateFacultyRequest } from './create-faculty.request';
import { CreateFacultyResponse } from './create-faculty.response';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';

@Controller('admin')
export class CreateFacultyController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('/create-faculty')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createFaculty(
        @Body() createFacultyData: CreateFacultyRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.createFacultyUserAPI(adminId, createFacultyData);

            const response: CreateFacultyResponse = {
                success: true,
                message: 'Faculty created successfully',
                data: result,
            };
            
            return response;            

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to create faculty',
            });

        }
    }
}
