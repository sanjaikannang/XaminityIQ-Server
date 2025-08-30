import { Controller, Req, UseGuards, Get, Query } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetBranchesResponse } from './get-branchs.response';


@Controller('admin')
export class GetBranchesController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('get-branches')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getBranches(
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getBranchesAPI(adminId);

            const response: GetBranchesResponse = {
                success: true,
                message: 'Branches fetched successfully',
                data: result,
            };

            return response;

        } catch (error) {
            const response: GetBranchesResponse = {
                success: false,
                message: error.message || 'Failed to fetch branches by course',
            };
            return response;
        }
    }
}
