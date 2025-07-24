import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
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


    // Generate Access Tokens
    generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
        try {
            const token = this.jwtService.sign(
                { ...payload, type: 'access' },
                {
                    secret: this.configService.getJWTSecretKey(),
                    expiresIn: this.configService.getJWTExpiresIn(),
                },
            );
            return token;
        } catch (error) {
            throw new UnauthorizedException('Failed to generate access token', error);
        }
    }


    // Generate Refresh Tokens
    generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
        try {
            const token = this.jwtService.sign(
                { ...payload, type: 'refresh' },
                {
                    secret: this.configService.getJwtRefreshSecretKey(),
                    expiresIn: this.configService.getJwtRefreshExpiry(),
                },
            );
            return token;
        } catch (error) {
            throw new UnauthorizedException('Failed to generate refresh token', error);
        }
    }


    // Verify Access Token
    verifyAccessToken(token: string): JwtPayload {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.getJWTSecretKey(),
            });

            return payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired access token', error);
        }
    }


    // Verify Refresh Token
    verifyRefreshToken(token: string): JwtPayload {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.getJwtRefreshSecretKey(),
            });

            return payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token', error);
        }
    }


    // Decode Token
    decodeToken(token: string): any {
        try {
            const decodeToken = this.jwtService.decode(token);
            return decodeToken;
        } catch (error) {
            throw new UnauthorizedException('Invalid token', error);
        }
    }
    
}