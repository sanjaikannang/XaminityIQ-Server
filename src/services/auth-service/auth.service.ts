import { Types } from "mongoose";
import { AuthJwtService } from './jwt.service';
import { PasswordService } from './password.service';
import { LoginRequest } from 'src/api/auth/login/login.request';
import { RefreshTokenRequest } from 'src/api/auth/refresh-token/refresh-token.request';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { ChangePasswordRequest } from 'src/api/auth/change-password/change-password.request';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
        private readonly passwordService: PasswordService,
        private readonly jwtService: AuthJwtService,
    ) { }


    // Login API Endpoint
    async loginAPI(loginData: LoginRequest) {
        const { email, password } = loginData;

        // Find user by email
        const user = await this.userRepositoryService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const userId = (user._id as Types.ObjectId).toString();

        // Generate tokens
        const accessToken = this.jwtService.generateAccessToken({
            sub: userId,
            email: user.email,
            role: user.role,
        });

        const refreshToken = this.jwtService.generateRefreshToken({
            sub: userId,
            email: user.email,
            role: user.role,
        });

        // Update user with tokens and last login
        await this.userRepositoryService.updateUserTokens(userId, accessToken, refreshToken);
        await this.userRepositoryService.updateLastLogin(userId);

        return {
            user: {
                id: (user._id as Types.ObjectId).toString(),
                email: user.email,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
            },
            tokens: {
                accessToken,
                refreshToken
            },
        };
    }


    // Refresh Token API Endpoint
    async refreshTokenAPI(refreshData: RefreshTokenRequest) {
        const { refreshToken } = refreshData;

        try {
            // Verify refresh token
            const payload = this.jwtService.verifyRefreshToken(refreshToken);

            // Find user by refresh token
            const user = await this.userRepositoryService.findUserByRefreshToken(refreshToken);
            if (!user) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Generate new tokens
            const newAccessToken = this.jwtService.generateAccessToken({
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
            });

            const newRefreshToken = this.jwtService.generateRefreshToken({
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
            });

            // Update user with new tokens
            await this.userRepositoryService.updateUserTokens(
                payload.sub,
                newAccessToken,
                newRefreshToken
            );

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }


    // Change Password API Endpoint
    async changePasswordAPI(changePasswordData: ChangePasswordRequest) {
        const { email, currentPassword, newPassword, confirmPassword } = changePasswordData;

        if (newPassword !== confirmPassword) {
            throw new BadRequestException('New password and confirm password do not match');
        }

        // Find user by email instead of userId
        const user = await this.userRepositoryService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Check if user has already changed password
        if (!user.isFirstLogin) {
            throw new BadRequestException('You have already changed your password. Please use the login to access your account.');
        }

        // Verify current password
        const isCurrentPasswordValid = await this.passwordService.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Validate new password strength
        const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(passwordValidation.message);
        }

        // Hash new password
        const hashedPassword = await this.passwordService.hashPassword(newPassword);

        // Update password
        await this.userRepositoryService.updateUserPassword((user._id as Types.ObjectId).toString(), hashedPassword);

        return {
            message: 'Password changed successfully'
        };
    }


    // Logout API Endpoint
    async logoutAPI(userId: string) {
        try {
            // Clear tokens from user
            await this.userRepositoryService.clearUserTokens(userId);

            return {
                message: 'Logged out successfully'
            };

        } catch (error) {
            throw new UnauthorizedException('Failed to logout');
        }
    }

}