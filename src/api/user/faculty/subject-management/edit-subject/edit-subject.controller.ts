import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Patch, Body, Req, Param, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { EditSubjectRequest } from './edit-subject.request';
import { EditSubjectResponse } from './edit-subject.response';

@Controller('faculty')
export class EditSubjectController {
    constructor(private readonly facultyService: FacultyService) { }

    @Patch('subjects/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async editSubject(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() data: EditSubjectRequest,
    ): Promise<EditSubjectResponse> {
        const userId = (req as any).user?.sub;
        await this.facultyService.editSubjectAPI(userId, id, data);

        return {
            success: true,
            message: 'Subject updated successfully',
        };
    }
}
