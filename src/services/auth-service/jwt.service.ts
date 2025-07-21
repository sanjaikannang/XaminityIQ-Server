import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'src/config/config.service';
import { UserRole } from 'src/utils/enum';

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    sessionId: string;
    type: 'access' | 'refresh';
}

@Injectable()
export class AuthJwtService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }


    generateAccessToken(user: { id?: string; _id: any }, sessionId: string): string {
        try {
            const payload = {
                sub: user.id ?? user._id.toString(),
                sessionId,
                type: 'access',
            };

            return this.jwtService.sign(payload, {
                secret: this.configService.getJWTSecretKey(),
                expiresIn: this.configService.getJWTExpiresIn(),
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to generate access token', error);
        }
    }

    generateRefreshToken(user: { id?: string; _id: any }, sessionId: string): string {
        try {
            const payload = {
                sub: user.id ?? user._id.toString(),
                sessionId,
                type: 'refresh',
            };

            return this.jwtService.sign(payload, {
                secret: this.configService.getJwtRefreshSecretKey(),
                expiresIn: this.configService.getJwtRefreshExpiry(),
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to generate refresh token', error);
        }
    }

    verifyAccessToken(token: string): JwtPayload {
        return this.jwtService.verify(token, {
            secret: this.configService.getJWTSecretKey(),
        });
    }

    verifyRefreshToken(token: string): JwtPayload {
        return this.jwtService.verify(token, {
            secret: this.configService.getJwtRefreshSecretKey(),
        });
    }

    decodeToken(token: string): any {
        return this.jwtService.decode(token);
    }
}