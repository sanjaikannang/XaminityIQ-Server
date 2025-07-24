import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRole } from 'src/utils/enum';
import { ulid } from 'ulid';
import { Types } from 'mongoose';
import { UserDocument } from 'src/schemas/user.schema';
import { AuthJwtService } from './jwt.service';
import { SessionRepositoryService } from 'src/repositories/session-repository/session.repository';
import { SessionDocument } from 'src/schemas/session.schema';

export interface SessionData {
    userId: string;
    role: UserRole;
    email: string;
    sessionId: string;
    accessToken: string;
    refreshToken: string;
    isFirstLogin: boolean;
    expiresAt: number;
    lastActivity: number;
    userAgent: string;
    ipAddress: string;
}

@Injectable()
export class SessionService {

    constructor(
        private readonly jwtService: AuthJwtService,
        private readonly sessionRepositoryService: SessionRepositoryService,
    ) { }


    // Create user session and generate tokens
    async createUserSession(user: UserDocument, userAgent: string, ipAddress: string): Promise<string> {
        try {
            const sessionId = ulid();

            // Generate JWT tokens
            const payload = {
                sub: (user._id as Types.ObjectId).toString(),
                email: user.email,
                role: user.role,
                sessionId: sessionId,
            };

            const accessToken = this.jwtService.generateAccessToken(payload);
            const refreshToken = this.jwtService.generateRefreshToken(payload);

            // Calculate expiration date (7 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            // Create session document
            const sessionData = {
                userId: (user._id as Types.ObjectId).toString(),
                sessionId: sessionId,
                accessToken: accessToken,
                refreshToken: refreshToken,
                userAgent: userAgent,
                ipAddress: ipAddress,
                expiresAt: expiresAt,
                isActive: true,
                lastActivity: new Date(),
            };

            // Save session to database
            await this.sessionRepositoryService.createSession(sessionData);

            return sessionId;

        } catch (error) {
            console.error('Error creating user session:', error);
            throw new InternalServerErrorException('Failed to create user session');
        }
    }



    // Get session details by session ID
    async getSession(sessionId: string): Promise<SessionData | null> {
        try {
            // Get session from database
            const dbSession = await this.sessionRepositoryService.findSessionById(sessionId);

            if (!dbSession || !dbSession.isActive) {
                return null;
            }

            // Check if session is expired
            if (dbSession.expiresAt.getTime() < Date.now()) {
                await this.deleteSession(sessionId);
                return null;
            }

            // Update last activity
            await this.sessionRepositoryService.updateSessionActivity(sessionId, new Date());

            // Get user details for the session
            const user = await this.sessionRepositoryService.getUserBySessionId(sessionId);
            if (!user) {
                return null;
            }

            // Return session data
            const sessionData: SessionData = {
                userId: dbSession.userId.toString(),
                role: user.role,
                email: user.email,
                sessionId: dbSession.sessionId,
                accessToken: dbSession.accessToken,
                refreshToken: dbSession.refreshToken,
                isFirstLogin: user.isFirstLogin || false,
                expiresAt: dbSession.expiresAt.getTime(),
                lastActivity: dbSession.lastActivity?.getTime() || Date.now(),
                userAgent: dbSession.userAgent,
                ipAddress: dbSession.ipAddress,
            };

            return sessionData;

        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }


    // Delete a specific session
    async deleteSession(sessionId: string): Promise<void> {
        try {
            await this.sessionRepositoryService.deactivateSession(sessionId);
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }


    // Delete all sessions for a user
    async deleteAllUserSessions(userId: string): Promise<void> {
        try {
            await this.sessionRepositoryService.deactivateAllUserSessions(userId);
        } catch (error) {
            console.error('Error deleting all user sessions:', error);
            throw error;
        }
    }


    // Get all active sessions for a user
    async getUserSessions(userId: string): Promise<SessionDocument[]> {
        try {
            return await this.sessionRepositoryService.findActiveSessionsByUserId(userId);
        } catch (error) {
            console.error('Error getting user sessions:', error);
            return [];
        }
    }


    // Check if session exists and is valid
    async isSessionValid(sessionId: string): Promise<boolean> {
        const session = await this.getSession(sessionId);
        return session !== null;
    }


    // Get session by refresh token (useful for token refresh)
    async getSessionByRefreshToken(refreshToken: string): Promise<SessionData | null> {
        try {
            const dbSession = await this.sessionRepositoryService.findSessionByRefreshToken(refreshToken);

            if (!dbSession || !dbSession.isActive) {
                return null;
            }

            // Check if session is expired
            if (dbSession.expiresAt.getTime() < Date.now()) {
                await this.deleteSession(dbSession.sessionId);
                return null;
            }

            // Get user details
            const user = await this.sessionRepositoryService.getUserBySessionId(dbSession.sessionId);
            if (!user) {
                return null;
            }

            const sessionData: SessionData = {
                userId: dbSession.userId.toString(),
                role: user.role,
                email: user.email,
                sessionId: dbSession.sessionId,
                accessToken: dbSession.accessToken,
                refreshToken: dbSession.refreshToken,
                isFirstLogin: user.isFirstLogin || false,
                expiresAt: dbSession.expiresAt.getTime(),
                // createdAt: dbSession.createdAt?.getTime() || Date.now(),
                lastActivity: dbSession.lastActivity?.getTime() || Date.now(),
                userAgent: dbSession.userAgent,
                ipAddress: dbSession.ipAddress,
            };

            return sessionData;

        } catch (error) {
            console.error('Error getting session by refresh token:', error);
            return null;
        }
    }


    // Utility method to clean up expired sessions (can be called by a cron job)
    async cleanupExpiredSessions(): Promise<void> {
        try {
            await this.sessionRepositoryService.deleteExpiredSessions();
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
        }
    }


    // Extend session expiration
    async extendSession(sessionId: string, additionalDays: number = 7): Promise<void> {
        try {
            const newExpirationDate = new Date();
            newExpirationDate.setDate(newExpirationDate.getDate() + additionalDays);

            await this.sessionRepositoryService.updateSessionExpiration(sessionId, newExpirationDate);
        } catch (error) {
            console.error('Error extending session:', error);
            throw error;
        }
    }

}
