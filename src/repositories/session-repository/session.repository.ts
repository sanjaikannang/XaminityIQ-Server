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


    // Update Session Activity
    async updateSessionActivity(sessionId: string, lastActivity: Date): Promise<SessionDocument | null> {
        try {
            const updatedSession = await this.sessionModel.findOneAndUpdate(
                { sessionId },
                { lastActivity },
                { new: true }
            ).exec();

            return updatedSession;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update session activity', error);
        }
    }


    // Get User by session Id
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
            throw new InternalServerErrorException('Failed to get user by session Id', error);
        }
    }


    // Find Active session by userId
    async findActiveSessionsByUserId(userId: string): Promise<SessionDocument[]> {
        try {
            const activity = await this.sessionModel.find({
                userId: new Types.ObjectId(userId),
                isActive: true,
                expiresAt: { $gt: new Date() }
            }).exec();

            return activity;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find active session by user Id', error);
        }
    }


    // Fine session by refresh token
    async findSessionByRefreshToken(refreshToken: string): Promise<SessionDocument | null> {
        try {
            const session = await this.sessionModel.findOne({ refreshToken, isActive: true }).exec();

            return session;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find session by refresh token', error);
        }
    }


    // Delete expired session
    async deleteExpiredSessions() {
        try {
            const deletedSession = await this.sessionModel.deleteMany({ expiresAt: { $lt: new Date() } }).exec();

            return deletedSession;
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete expired session', error);
        }
    }


    // Update session expiration
    async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<SessionDocument | null> {
        try {
            const updatedSession = await this.sessionModel.findOneAndUpdate(
                { sessionId },
                { expiresAt },
                { new: true }
            ).exec();

            return updatedSession;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update session expirstion', error);
        }
    }


    // Find Session by Id
    async findSessionById(sessionId: string): Promise<SessionDocument | null> {
        try {
            const session = await this.sessionModel.findOne({ sessionId, isActive: true }).exec();

            return session;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find session', error);
        }
    }


    // Update Session
    async updateSession(sessionId: string, updates: Partial<Session>): Promise<SessionDocument | null> {
        try {
            const updatedSession = await this.sessionModel.findOneAndUpdate(
                { sessionId },
                { ...updates, lastActivity: new Date() },
                { new: true }
            ).exec();

            return updatedSession;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update session', error);
        }
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


    // Cleanup expired session
    async cleanupExpiredSessions() {
        try {
            const cleanedExpiredSession = await this.sessionModel.deleteMany({
                expiresAt: { $lt: new Date() }
            }).exec();

            return cleanedExpiredSession;
        } catch (error) {
            throw new InternalServerErrorException('Failed to cleanup expired session', error);
        }
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


    // Delete by userId
    async deleteByUserId(userId: string): Promise<{ deletedCount: number }> {
        return await this.sessionModel.deleteMany({ userId }).exec();
    }


    // Find by UserId
    async findByUserId(userId: string): Promise<SessionDocument[]> {
        return await this.sessionModel.find({ userId }).exec();
    }

}