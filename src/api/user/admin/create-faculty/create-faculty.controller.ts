import { Controller, Post, Body, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateFacultyRequest } from './create-faculty.request';
import { CreateFacultyResponse } from './create-faculty.response';
import { UserRole } from 'src/utils/enum';

@Controller('admin')
export class CreateFacultyController {
    constructor(private readonly authService: AuthService) { }

    @Post('faculty/create')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createFaculty(
        @Body() createFacultyData: CreateFacultyRequest,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        try {
            const adminId = req.user?.sub;

            const result = await this.authService.createFacultyUser(adminId, createFacultyData);

            const response: CreateFacultyResponse = {
                success: true,
                message: 'Faculty created successfully',
                data: result,
            };

            res.status(HttpStatus.CREATED).json(response);
        } catch (error) {
            const response: CreateFacultyResponse = {
                success: false,
                message: error.message || 'Failed to create faculty',
            };

            const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json(response);
        }
    }
}
