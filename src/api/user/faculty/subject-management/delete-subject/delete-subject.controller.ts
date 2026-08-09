import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Delete, Req, Param, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { DeleteSubjectResponse } from './delete-subject.response';

@Controller('faculty')
export class DeleteSubjectController {
    constructor(private readonly facultyService: FacultyService) { }

    @Delete('subjects/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async deleteSubject(
        @Req() req: Request,
        @Param('id') id: string,
    ): Promise<DeleteSubjectResponse> {
        const userId = (req as any).user?.sub;
        await this.facultyService.deleteSubjectAPI(userId, id);

        return {
            success: true,
            message: 'Subject deleted successfully',
        };
    }
}
