import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { UserRole } from 'src/utils/enum';
import { ulid } from 'ulid';
import { Types } from 'mongoose';
import { UserDocument } from 'src/schemas/user.schema';
import { AuthJwtService } from './jwt.service';
import { SessionRepositoryService } from 'src/repositories/session-repository/session.repository';

export interface RedisSession {
    userId: string;
    role: UserRole;
    email: string;
    sessionId: string;
    accessToken: string;
    refreshToken: string;
    isFirstLogin: boolean;
    expiresAt: number;
    createdAt: number;
    lastActivity: number;
    userAgent: string;
    ipAddress: string;
}

@Injectable()
export class SessionService {
    private readonly sessionTTL: number = 7 * 24 * 60 * 60; // 7 days in seconds
    private readonly maxSessionsPerUser: number = 3;

    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly jwtService: AuthJwtService,
        private readonly sessionRepository: SessionRepositoryService,
    ) { }


    // Create user session and generate tokens
    async createUserSession(user: UserDocument, userAgent: string, ipAddress: string): Promise<string> {
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
        await this.sessionRepository.createSession(sessionData);

        return sessionId;
    }

    async createSession(sessionData: Omit<RedisSession, 'sessionId' | 'createdAt' | 'lastActivity'>): Promise<string> {
        const sessionId = ulid();
        const now = Date.now();

        const session: RedisSession = {
            ...sessionData,
            sessionId,
            createdAt: now,
            lastActivity: now,
        };

        // Check existing sessions for user
        await this.cleanupOldSessions(sessionData.userId);

        // Store session
        await this.redis.setex(
            `session:${sessionId}`,
            this.sessionTTL,
            JSON.stringify(session),
        );

        // Track user sessions
        await this.redis.sadd(`user_sessions:${sessionData.userId}`, sessionId);
        await this.redis.expire(`user_sessions:${sessionData.userId}`, this.sessionTTL);

        return sessionId;
    }

    async getSession(sessionId: string): Promise<RedisSession | null> {
        const sessionData = await this.redis.get(`session:${sessionId}`);
        return sessionData ? JSON.parse(sessionData) : null;
    }

    async updateSession(sessionId: string, updates: Partial<RedisSession>): Promise<void> {
        const session = await this.getSession(sessionId);
        if (!session) return;

        const updatedSession = {
            ...session,
            ...updates,
            lastActivity: Date.now(),
        };

        await this.redis.setex(
            `session:${sessionId}`,
            this.sessionTTL,
            JSON.stringify(updatedSession),
        );
    }

    async deleteSession(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (session) {
            await this.redis.del(`session:${sessionId}`);
            await this.redis.srem(`user_sessions:${session.userId}`, sessionId);
        }
    }

    async deleteAllUserSessions(userId: string): Promise<void> {
        const sessionIds = await this.redis.smembers(`user_sessions:${userId}`);

        if (sessionIds.length > 0) {
            const pipeline = this.redis.pipeline();
            sessionIds.forEach(sessionId => {
                pipeline.del(`session:${sessionId}`);
            });
            await pipeline.exec();
        }

        await this.redis.del(`user_sessions:${userId}`);
    }

    private async cleanupOldSessions(userId: string): Promise<void> {
        const sessionIds = await this.redis.smembers(`user_sessions:${userId}`);

        if (sessionIds.length >= this.maxSessionsPerUser) {
            // Get session details to find oldest
            const sessions = await Promise.all(
                sessionIds.map(async (id) => {
                    const session = await this.getSession(id);
                    return session ? { id, createdAt: session.createdAt } : null;
                }),
            );

            const validSessions = sessions.filter(Boolean) as { id: string, createdAt: number }[];
            validSessions.sort((a, b) => a.createdAt - b.createdAt);

            // Remove oldest sessions
            const sessionsToRemove = validSessions.slice(0, validSessions.length - this.maxSessionsPerUser + 1);

            for (const session of sessionsToRemove) {
                await this.deleteSession(session.id);
            }
        }
    }
}
