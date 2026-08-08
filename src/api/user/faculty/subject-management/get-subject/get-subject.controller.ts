import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, Param, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { GetSubjectResponse } from './get-subject.response';

@Controller('faculty')
export class GetSubjectController {
    constructor(private readonly facultyService: FacultyService) { }

    @Get('subjects/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async getSubject(
        @Req() req: Request,
        @Param('id') id: string,
    ): Promise<GetSubjectResponse> {
        const userId = (req as any).user?.sub;
        const subject = await this.facultyService.getSubjectByIdAPI(userId, id);

        return {
            success: true,
            message: 'Subject fetched successfully',
            data: subject,
        };
    }
}
