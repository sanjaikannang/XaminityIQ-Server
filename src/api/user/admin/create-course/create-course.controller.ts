import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { CreateCourseRequest } from './create-course.request';
import { CreateCourseResponse } from './create-course.response';

@Controller('admin')
export class CreateCourseController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('create-course')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createCourse(
        @Body() createCourseData: CreateCourseRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.createCourseAPI(adminId, createCourseData);

            const response: CreateCourseResponse = {
                success: true,
                message: 'Course created successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to create course',
            });

        }
    }
}
