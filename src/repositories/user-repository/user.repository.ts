import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/User/user.schema';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';


@Injectable()
export class UserRepositoryService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }


    // Find user by email
    async findUserByEmail(email: string): Promise<UserDocument | null> {
        try {
            const user = await this.userModel.findOne({ email, isActive: true }).exec();
            return user;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find user by email', error);
        }
    }


    // Update user
    async updateUser(id: string, updates: Partial<User>): Promise<UserDocument | null> {
        try {
            const updatedUser = this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
            return updatedUser;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update user', error);
        }
    }


    // Update user tokens
    async updateUserTokens(userId: string, accessToken: string, refreshToken: string): Promise<void> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    accessToken,
                    refreshToken,
                },
                { new: true }
            ).exec();

            if (!updatedUser) {
                throw new NotFoundException(`User with id ${userId} not found`);
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to update user tokens', error);
        }
    }


    // Find user by refresh token
    async findUserByRefreshToken(refreshToken: string): Promise<UserDocument | null> {
        try {
            const user = await this.userModel.findOne({
                refreshToken,
                isActive: true
            }).exec();
            return user;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find user by refresh token', error);
        }
    }


    // Clear user tokens (for logout)
    async clearUserTokens(userId: string): Promise<void> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    accessToken: null,
                    refreshToken: null,
                },
                { new: true }
            ).exec();

            if (!updatedUser) {
                throw new NotFoundException(`User with id ${userId} not found`);
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to clear user tokens', error);
        }
    }


    // Update user password
    async updateUserPassword(id: string, password: string): Promise<UserDocument | null> {
        try {
            const updatedPassword = this.userModel.findByIdAndUpdate(
                id,
                {
                    password,
                    isFirstLogin: false,
                    lastPasswordChange: new Date(),
                },
                { new: true }
            ).exec();

            return updatedPassword;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update user password', error);
        }
    }


    // Update Last Login
    async updateLastLogin(id: string): Promise<void> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(
                id,
                { lastLogin: new Date() }
            ).exec();

            // want to check if the user was actually found and updated
            if (!updatedUser) {
                throw new NotFoundException(`User with id ${id} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update last login', error);
        }
    }


    // Start Session
    async startSession() {
        return await this.userModel.db.startSession();
    }


    // Create User
    async create(data: Partial<User>, session?: any): Promise<UserDocument> {
        try {
            const user = new this.userModel(data);
            return await user.save({ session });
        } catch (error) {
            throw new InternalServerErrorException('Failed to create user', error);
        }
    }

}