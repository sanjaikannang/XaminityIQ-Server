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


    // Find user by id
    async findUserById(id: string): Promise<UserDocument | null> {
        try {
            const user = this.userModel.findById(id).exec();
            return user;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find user by Id', error);
        }
    }


    // Create User
    async createUser(userData: {
        email: string;
        password: string;
        role: UserRole;
        createdBy?: string;
    }): Promise<UserDocument> {
        try {
            const user = new this.userModel({
                ...userData,
                createdBy: userData.createdBy ? new Types.ObjectId(userData.createdBy) : undefined,
            });
            return user.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create user', error);
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


    // Check email exists
    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const user = await this.userModel.findOne({ email }).exec();
            return !!user;
        } catch (error) {
            throw new InternalServerErrorException('Failed to check email exist', error);
        }
    }


    // Get user profile
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


    // get User Profile 
    async getUserWithProfile(id: string): Promise<{
        user: UserDocument;
        profile: any;
    } | null> {
        try {
            const user = await this.findUserById(id);
            if (!user) return null;

            const profile = await this.getUserProfile(id, user.role);
            return { user, profile };
        } catch (error) {
            throw new InternalServerErrorException('Failed to get user profile data', error);
        }
    }


    // Find user by Role
    async findUsersByRole(role: UserRole): Promise<UserDocument[]> {
        try {
            const user = this.userModel.find({ role, isActive: true }).exec();
            return user;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update user password', error);
        }
    }


    // Find by ID and Delete
    async findByIdAndDelete(id: string): Promise<UserDocument | null> {
        return await this.userModel.findByIdAndDelete(id).exec();
    }


    // Delete by ID
    async deleteById(id: string): Promise<boolean> {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        return result.deletedCount > 0;
    }

}