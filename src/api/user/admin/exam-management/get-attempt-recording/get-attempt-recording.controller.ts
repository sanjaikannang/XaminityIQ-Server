import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { GetAttemptRecordingResponse } from './get-attempt-recording.response';

@Controller('admin')
export class GetAttemptRecordingController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Get('attempts/:attemptId/recording')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAttemptRecording(@Param('attemptId') attemptId: string): Promise<GetAttemptRecordingResponse> {
        const data = await this.examManagementService.getAttemptRecordingAPI(attemptId);

        return {
            success: true,
            message: 'Attempt recording fetched successfully',
            data,
        };
    }
}
