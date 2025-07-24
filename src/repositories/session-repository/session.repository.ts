import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from 'src/schemas/session.schema';
import { UserDocument } from 'src/schemas/user.schema';

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

    async updateSessionActivity(sessionId: string, lastActivity: Date): Promise<SessionDocument | null> {
        try {
            const updatedSession = await this.sessionModel.findOneAndUpdate(
                { sessionId },
                { lastActivity },
                { new: true }
            ).exec();

            return updatedSession;
        } catch (error) {
            console.error('Error updating session activity:', error);
            return null;
        }
    }

    async getUserBySessionId(sessionId: string): Promise<UserDocument | null> {
        try {
            // Find the session and populate the user reference
            const session = await this.sessionModel
                .findOne({ sessionId, isActive: true })
                .populate('userId') // This will load the User document
                .exec();

            if (!session || !session.userId) {
                return null;
            }

            const user = session.userId as unknown as UserDocument;

            return user;
        } catch (error) {
            console.error('Error getting user by session ID:', error);
            return null;
        }
    }

    async findActiveSessionsByUserId(userId: string): Promise<SessionDocument[]> {
        return this.sessionModel.find({
            userId: new Types.ObjectId(userId),
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).exec();
    }

    async findSessionByRefreshToken(refreshToken: string): Promise<SessionDocument | null> {
        return this.sessionModel.findOne({ refreshToken, isActive: true }).exec();
    }

    async deleteExpiredSessions() {
        return this.sessionModel.deleteMany({ expiresAt: { $lt: new Date() } }).exec();
    }

    async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<SessionDocument | null> {
        return this.sessionModel.findOneAndUpdate(
            { sessionId },
            { expiresAt },
            { new: true }
        ).exec();
    }


    async findSessionById(sessionId: string): Promise<SessionDocument | null> {
        try {
            const session = await this.sessionModel.findOne({ sessionId, isActive: true }).exec();

            return session;
        } catch (error) {
            console.error('Error finding session by ID:', error);
            return null;
        }
    }

    async updateSession(sessionId: string, updates: Partial<Session>): Promise<SessionDocument | null> {
        return this.sessionModel.findOneAndUpdate(
            { sessionId },
            { ...updates, lastActivity: new Date() },
            { new: true }
        ).exec();
    }


    // Deactivate Session
    async deactivateSession(sessionId: string): Promise<void> {
        try {
            await this.sessionModel.findOneAndUpdate(
                { sessionId },
                { isActive: false }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to deactivate session', error);
        }
    }


    // Deactivate All Users Session
    async deactivateAllUserSessions(userId: string): Promise<void> {
        try {
            await this.sessionModel.updateMany(
                { userId: new Types.ObjectId(userId) },
                { isActive: false }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to deactivate all user session', error);
        }
    }

    async cleanupExpiredSessions(): Promise<void> {
        await this.sessionModel.deleteMany({
            expiresAt: { $lt: new Date() }
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