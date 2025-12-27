import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BulkUploadStudentsRequest } from './bulk-upload-students.request';
import { BulkUploadStudentsResponse } from './bulk-upload-students.response';
import { StudentManagementService } from 'src/services/user-service/admin/student-management.service';

@Controller('admin')
export class BulkUploadStudentsController {
    constructor(private readonly studentManagementService: StudentManagementService) { }

    @Post('students/bulk-upload')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async bulkUploadStudents(
        @Body() bulkUploadData: BulkUploadStudentsRequest
    ): Promise<BulkUploadStudentsResponse> {

        const summary = await this.studentManagementService.bulkUploadStudentsAPI(bulkUploadData);

        const response: BulkUploadStudentsResponse = {
            success: true,
            message: `Bulk upload completed. ${summary.successCount} students uploaded successfully, ${summary.failedCount} failed.`,
            summary: summary
        };

        return response;
    }
}