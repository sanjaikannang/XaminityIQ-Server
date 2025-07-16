import { Injectable } from '@nestjs/common';
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

    // User Operations
    async findUserByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email, isActive: true }).exec();
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

    async updateLastLogin(id: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
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