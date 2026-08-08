import { Request, Response } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';

const PROBE_PAYLOAD = Buffer.alloc(1024 * 1024); // 1MB of zero bytes, timed client-side

@Controller('student')
export class NetworkProbeController {

    @Get('exams/network-probe/download')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    downloadProbe(@Res() res: Response) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(PROBE_PAYLOAD);
    }

    @Post('exams/network-probe/upload')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    async uploadProbe(@Req() req: Request) {
        // Sent as application/octet-stream, so Nest's default JSON body-parser never
        // touches it — drain the raw stream ourselves so the response isn't sent until
        // every byte has actually arrived (otherwise the client's timing would be wrong).
        await new Promise<void>((resolve, reject) => {
            req.on('data', () => { });
            req.on('end', () => resolve());
            req.on('error', reject);
        });

        return { success: true, message: 'Upload probe received' };
    }
}
