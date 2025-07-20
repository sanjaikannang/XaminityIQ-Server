import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from 'src/schemas/session.schema';

@Injectable()
export class SessionRepositoryService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    ) { }


    // Create a new session
    async createSession(sessionData: {
        userId: string;
        sessionId: string;
        accessToken: string;
        refreshToken: string;
        userAgent: string;
        ipAddress: string;
        expiresAt: Date;
    }): Promise<SessionDocument> {
        try {
            const session = new this.sessionModel({
                ...sessionData,
                userId: new Types.ObjectId(sessionData.userId),
            });

            const savedSession = await session.save();
            return savedSession;
        } catch (error) {
            throw new InternalServerErrorException('Failed to create session', error);
        }
    }

    async findSessionByToken(refreshToken: string): Promise<SessionDocument | null> {
        return this.sessionModel.findOne({ refreshToken, isActive: true }).exec();
    }

    async findSessionById(sessionId: string): Promise<SessionDocument | null> {
        return this.sessionModel.findOne({ sessionId, isActive: true }).exec();
    }

    async updateSession(sessionId: string, updates: Partial<Session>): Promise<SessionDocument | null> {
        return this.sessionModel.findOneAndUpdate(
            { sessionId },
            { ...updates, lastActivity: new Date() },
            { new: true }
        ).exec();
    }

    async deactivateSession(sessionId: string): Promise<void> {
        await this.sessionModel.findOneAndUpdate(
            { sessionId },
            { isActive: false }
        ).exec();
    }

    async deactivateAllUserSessions(userId: string): Promise<void> {
        await this.sessionModel.updateMany(
            { userId: new Types.ObjectId(userId) },
            { isActive: false }
        ).exec();
    }

    async cleanupExpiredSessions(): Promise<void> {
        await this.sessionModel.deleteMany({
            expiresAt: { $lt: new Date() }
        }).exec();
    }

    async getActiveSessionCount(userId: string): Promise<number> {
        return this.sessionModel.countDocuments({
            userId: new Types.ObjectId(userId),
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).exec();
    }

    // Get tokens by session ID
    async getTokensBySessionId(sessionId: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        try {
            const session = await this.sessionModel.findOne({
                sessionId: sessionId,
                isActive: true,
                expiresAt: { $gt: new Date() }
            }).exec();

            if (!session) {
                return null;
            }

            const tokens = {
                accessToken: session.accessToken,
                refreshToken: session.refreshToken,
            };

            return tokens;
        } catch (error) {
            throw new InternalServerErrorException('Failed to get tokens by session ID', error);
        }
    }

}