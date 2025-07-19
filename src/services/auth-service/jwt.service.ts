import { Injectable } from '@nestjs/common';
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

    generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
        return this.jwtService.sign(
            { ...payload, type: 'access' },
            {
                secret: this.configService.getJWTSecretKey(),
                expiresIn: this.configService.getJWTExpiresIn(),
            },
        );
    }

    generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
        return this.jwtService.sign(
            { ...payload, type: 'refresh' },
            {
                secret: this.configService.getJwtRefreshSecretKey(),
                expiresIn: this.configService.getJwtRefreshExpiry(),
            },
        );
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