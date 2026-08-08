import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { FacultyService } from 'src/services/user-service/faculty/faculty.service';
import { CreateSubjectRequest } from './create-subject.request';
import { CreateSubjectResponse } from './create-subject.response';

@Controller('faculty')
export class CreateSubjectController {
    constructor(private readonly facultyService: FacultyService) { }

    @Post('subjects')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.FACULTY)
    async createSubject(
        @Req() req: Request,
        @Body() data: CreateSubjectRequest,
    ): Promise<CreateSubjectResponse> {
        const userId = (req as any).user?.sub;
        const subject = await this.facultyService.createSubjectAPI(userId, data);

        return {
            success: true,
            message: 'Subject created successfully',
            subjectId: (subject._id as any).toString(),
        };
    }
}
