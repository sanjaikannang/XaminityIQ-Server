import { Controller, Req, UseGuards, Get, Query } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetSectionsResponse } from './get-section.response';

@Controller('admin')
export class GetSectionsController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-sections')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getSections(
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getSectionsAPI(adminId);

            const response: GetSectionsResponse = {
                success: true,
                message: 'Sections fetched successfully',
                data: result,
            };

            return response;

        } catch (error) {
            const response: GetSectionsResponse = {
                success: false,
                message: error.message || 'Failed to fetch sections',
            };
            return response;
        }
    }
}
