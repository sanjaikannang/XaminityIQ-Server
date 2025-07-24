import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UserRole } from 'src/utils/enum';

@Injectable()
export class UserRepositoryService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel('Faculty') private facultyModel: Model<any>,
        @InjectModel('Student') private studentModel: Model<any>,
        @InjectModel('Admin') private adminModel: Model<any>,
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

    
    async findUserById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }


    async createUser(userData: {
        email: string;
        password: string;
        role: UserRole;
        createdBy?: string;
    }): Promise<UserDocument> {
        const user = new this.userModel({
            ...userData,
            createdBy: userData.createdBy ? new Types.ObjectId(userData.createdBy) : undefined,
        });
        return user.save();
    }

    
    async updateUser(id: string, updates: Partial<User>): Promise<UserDocument | null> {
        return this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    }


    async updateUserPassword(id: string, password: string): Promise<UserDocument | null> {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                password,
                isFirstLogin: false,
                lastPasswordChange: new Date(),
            },
            { new: true }
        ).exec();
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


    async checkEmailExists(email: string): Promise<boolean> {
        const user = await this.userModel.findOne({ email }).exec();
        return !!user;
    }


    async getUserProfile(userId: string, role: UserRole): Promise<any> {
        const objectId = new Types.ObjectId(userId);

        switch (role) {
            case UserRole.FACULTY:
                return this.facultyModel.findOne({ userId: objectId }).exec();
            case UserRole.STUDENT:
                return this.studentModel.findOne({ userId: objectId }).exec();
            case UserRole.ADMIN:
                return this.adminModel.findOne({ userId: objectId }).exec();
            default:
                return null;
        }
    }


    async getUserWithProfile(id: string): Promise<{
        user: UserDocument;
        profile: any;
    } | null> {
        const user = await this.findUserById(id);
        if (!user) return null;

        const profile = await this.getUserProfile(id, user.role);
        return { user, profile };
    }


    async findUsersByRole(role: UserRole): Promise<UserDocument[]> {
        return this.userModel.find({ role, isActive: true }).exec();
    }

}