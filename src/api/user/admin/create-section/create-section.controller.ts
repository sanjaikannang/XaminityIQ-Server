import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { CreateSectionRequest } from './create-section.request';
import { CreateSectionResponse } from './create-section.response';


@Controller('admin')
export class CreateSectionController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('create-section')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createSection(
        @Body() createSectionData: CreateSectionRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.createSectionAPI(adminId, createSectionData);

            const response: CreateSectionResponse = {
                success: true,
                message: 'Section created successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to create section',
            });

        }
    }
}
