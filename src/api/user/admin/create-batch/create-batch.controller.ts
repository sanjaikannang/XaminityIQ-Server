import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/user-service/admin/admin.service';
import { CreateBatchRequest } from './create-batch.request';
import { CreateBatchResponse } from './create-batch.response';

@Controller('admin')
export class CreateBatchController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Post('create-batch')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createBatch(
        @Body() createBatchData: CreateBatchRequest,
        @Req() req: Request,
    ) {
        try {
            const adminId = (req as any).user?.sub;

            const result = await this.adminService.createBatchAPI(adminId, createBatchData);

            const response: CreateBatchResponse = {
                success: true,
                message: 'Batch created successfully',
                data: result,
            };

            return response;

        } catch (error) {
            ({
                success: false,
                message: error.message || 'Failed to create batch',
            });

        }
    }
}
