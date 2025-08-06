import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetSectionsByBranchRequest } from './get-sections-by-branch.request';
import { GetSectionsByBranchResponse } from './get-sections-by-branch.response';

@Controller('admin')
export class GetSectionsByBranchController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('get-sections-by-branch')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getSectionsByBranch(
        @Body() getSectionsByBranchData: GetSectionsByBranchRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getSectionsByBranchAPI(adminId, getSectionsByBranchData);

            const response: GetSectionsByBranchResponse = {
                success: true,
                message: 'Sections fetched successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to fetch sections',
            });

        }
    }
}
