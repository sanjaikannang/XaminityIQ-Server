import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateBatchRequest } from './create-batch.request';
import { CreateBatchResponse } from './create-batch.response';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';

@Controller('admin')
export class CreateBatchController {
    constructor(private readonly adminService: AdminService) { }

    @Post('batches')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createBatch(
        @Body() createBatchData: CreateBatchRequest,
    ) {
        await this.adminService.createBatchAPI(createBatchData);

        const response: CreateBatchResponse = {
            success: true,
            message: 'Batch Created Successfully'
        };

        return response;
    }
}