import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ulid } from 'ulid';
import { Types } from 'mongoose';
import { UserDocument } from 'src/schemas/user.schema';
import { AuthJwtService } from './jwt.service';

export interface SessionData {
    userId: string;
    sessionId: string;
    accessToken: string;
    refreshToken: string;
    userAgent: string;
    ipAddress: string;
    email: string;
    role: string;
    expiresAt: Date;
    isActive: boolean;
    lastActivity: Date;
    createdAt: Date;
}

@Injectable()
export class SessionService {

    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly jwtService: AuthJwtService,
    ) { }


    // Create user session and generate tokens
    async createUserSession(user: UserDocument, userAgent: string, ipAddress: string): Promise<string> {
        const sessionId = ulid();
        const userId = (user._id as Types.ObjectId).toString();

        // Generate JWT tokens
        const accessToken = await this.jwtService.generateAccessToken(user, sessionId);
        const refreshToken = await this.jwtService.generateRefreshToken(user, sessionId);

        // Calculate expiration (30 days for refresh token)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const sessionData: SessionData = {
            userId,
            sessionId,
            accessToken,
            refreshToken,
            userAgent,
            ipAddress,
            email: user.email,
            role: user.role,
            expiresAt,
            isActive: true,
            lastActivity: new Date(),
            createdAt: new Date(),
        };

        // Store session in Redis with expiration (30 days in seconds)
        const expirationSeconds = 30 * 24 * 60 * 60; // 30 days
        await this.redis.setex(
            `session:${sessionId}`,
            expirationSeconds,
            JSON.stringify(sessionData)
        );

        // Also store a mapping from userId to active sessions for easy cleanup
        await this.redis.sadd(`user_sessions:${userId}`, sessionId);
        await this.redis.expire(`user_sessions:${userId}`, expirationSeconds);

        // Store refresh token mapping for quick lookup
        await this.redis.setex(
            `refresh_token:${refreshToken}`,
            expirationSeconds,
            sessionId
        );

        return sessionId;
    }

    async getSessionBySessionId(sessionId: string): Promise<SessionData | null> {
        const sessionDataStr = await this.redis.get(`session:${sessionId}`);
        if (!sessionDataStr) {
            return null;
        }

        const sessionData: SessionData = JSON.parse(sessionDataStr);

        // Check if session is expired
        if (new Date() > new Date(sessionData.expiresAt) || !sessionData.isActive) {
            await this.invalidateSession(sessionId);
            return null;
        }

        return sessionData;
    }

    async getSessionByRefreshToken(refreshToken: string): Promise<SessionData | null> {
        const sessionId = await this.redis.get(`refresh_token:${refreshToken}`);
        if (!sessionId) {
            return null;
        }

        return this.getSessionBySessionId(sessionId);
    }


    async updateLastActivity(sessionId: string): Promise<void> {
        const sessionData = await this.getSessionBySessionId(sessionId);
        if (!sessionData) {
            return;
        }

        sessionData.lastActivity = new Date();

        const expirationSeconds = Math.floor((new Date(sessionData.expiresAt).getTime() - Date.now()) / 1000);
        if (expirationSeconds > 0) {
            await this.redis.setex(
                `session:${sessionId}`,
                expirationSeconds,
                JSON.stringify(sessionData)
            );
        }
    }

    async invalidateSession(sessionId: string): Promise<void> {
        const sessionData = await this.getSessionBySessionId(sessionId);

        if (sessionData) {
            // Remove from user sessions set
            await this.redis.srem(`user_sessions:${sessionData.userId}`, sessionId);

            // Remove refresh token mapping
            await this.redis.del(`refresh_token:${sessionData.refreshToken}`);
        }

        // Remove the session itself
        await this.redis.del(`session:${sessionId}`);
    }

    async invalidateAllUserSessions(userId: string): Promise<void> {
        const sessionIds = await this.redis.smembers(`user_sessions:${userId}`);

        for (const sessionId of sessionIds) {
            await this.invalidateSession(sessionId);
        }

        await this.redis.del(`user_sessions:${userId}`);
    }

    async refreshTokens(refreshToken: string, userAgent: string, ipAddress: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null> {
        const sessionData = await this.getSessionByRefreshToken(refreshToken);
        if (!sessionData) {
            return null;
        }

        // Verify the refresh token is valid
        try {
            const decoded = await this.jwtService.verifyRefreshToken(refreshToken);
            if (decoded.sessionId !== sessionData.sessionId) {
                await this.invalidateSession(sessionData.sessionId);
                return null;
            }
        } catch (error) {
            await this.invalidateSession(sessionData.sessionId);
            return null;
        }

        // Generate new tokens
        const userObj = {
            _id: new Types.ObjectId(sessionData.userId),
            email: sessionData.email,
            role: sessionData.role,
        } as UserDocument;

        const newAccessToken = await this.jwtService.generateAccessToken(userObj, sessionData.sessionId);
        const newRefreshToken = await this.jwtService.generateRefreshToken(userObj, sessionData.sessionId);

        // Update session data
        sessionData.accessToken = newAccessToken;
        sessionData.refreshToken = newRefreshToken;
        sessionData.userAgent = userAgent;
        sessionData.ipAddress = ipAddress;
        sessionData.lastActivity = new Date();

        // Remove old refresh token mapping
        await this.redis.del(`refresh_token:${refreshToken}`);

        // Store updated session
        const expirationSeconds = Math.floor((new Date(sessionData.expiresAt).getTime() - Date.now()) / 1000);
        if (expirationSeconds > 0) {
            await this.redis.setex(
                `session:${sessionData.sessionId}`,
                expirationSeconds,
                JSON.stringify(sessionData)
            );

            // Store new refresh token mapping
            await this.redis.setex(
                `refresh_token:${newRefreshToken}`,
                expirationSeconds,
                sessionData.sessionId
            );
        }

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }


    async getUserActiveSessions(userId: string): Promise<SessionData[]> {
        const sessionIds = await this.redis.smembers(`user_sessions:${userId}`);
        const sessions: SessionData[] = [];

        for (const sessionId of sessionIds) {
            const sessionData = await this.getSessionBySessionId(sessionId);
            if (sessionData) {
                sessions.push(sessionData);
            }
        }

        return sessions;
    }

    // Cleanup expired sessions (you can run this periodically)
    async cleanupExpiredSessions(): Promise<void> {
        // This is a basic cleanup - in production, you might want to use Redis SCAN
        // for better performance with large datasets
        const pattern = 'session:*';
        const keys = await this.redis.keys(pattern);

        for (const key of keys) {
            const sessionDataStr = await this.redis.get(key);
            if (sessionDataStr) {
                const sessionData: SessionData = JSON.parse(sessionDataStr);
                if (new Date() > new Date(sessionData.expiresAt)) {
                    const sessionId = key.replace('session:', '');
                    await this.invalidateSession(sessionId);
                }
            }
        }
    }

}
