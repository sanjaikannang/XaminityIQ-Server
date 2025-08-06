import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { CreateBranchRequest } from './create-branch.request';
import { CreateBranchResponse } from './create-branch.response';


@Controller('admin')
export class CreateBranchController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('create-branch')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createBranch(
        @Body() createBranchData: CreateBranchRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.createBranchAPI(adminId, createBranchData);

            const response: CreateBranchResponse = {
                success: true,
                message: 'Branch created successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to create branch',
            });

        }
    }
}
