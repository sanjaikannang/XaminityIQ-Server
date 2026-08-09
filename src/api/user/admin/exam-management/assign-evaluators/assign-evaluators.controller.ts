import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ExamManagementService } from 'src/services/user-service/admin/exam-management.service';
import { AssignEvaluatorsRequest } from './assign-evaluators.request';
import { AssignEvaluatorsResponse } from './assign-evaluators.response';

@Controller('admin')
export class AssignEvaluatorsController {
    constructor(private readonly examManagementService: ExamManagementService) { }

    @Patch('exams/:id/evaluators')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async assignEvaluators(
        @Param('id') id: string,
        @Body() data: AssignEvaluatorsRequest,
    ): Promise<AssignEvaluatorsResponse> {
        await this.examManagementService.assignEvaluatorsAPI(id, data.evaluatorFacultyIds);

        return {
            success: true,
            message: 'Evaluators assigned successfully',
        };
    }
}
