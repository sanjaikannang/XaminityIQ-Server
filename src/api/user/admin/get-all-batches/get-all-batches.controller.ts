import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetAllBatchesRequest } from './get-all-batches.request';
import { GetAllBatchesResponse } from './get-all-batches.response';
import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminService } from 'src/services/user-service/admin/admin.service';

@Controller('admin')
export class GetAllBatchesController {
    constructor(private readonly adminService: AdminService) { }

    @Get('batches')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllBatches(
        @Query() query: GetAllBatchesRequest
    ): Promise<GetAllBatchesResponse> {

        const result = await this.adminService.getAllBatchesAPI(query);

        const response: GetAllBatchesResponse = {
            success: true,
            message: result.batches.length > 0
                ? 'Batch Data Fetched Successfully'
                : 'No batches found',
            data: result.batches,
            pagination: result.pagination
        };

        return response;
    }
}