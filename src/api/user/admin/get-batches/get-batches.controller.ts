import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { GetBatchesRequest } from './get-batches.request';
import { GetBatchesResponse } from './get-batches.response';


@Controller('admin')
export class GetBatchesController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('get-batches')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getBatches(
        @Body() getBatchesData: GetBatchesRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.getBatchesAPI(adminId, getBatchesData);

            const response: GetBatchesResponse = {
                success: true,
                message: 'Batches fetched successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to fetch batches',
            });

        }
    }
}
