import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Admin, AdminDocument } from 'src/schemas/admin.schema';

@Injectable()
export class AdminRepositoryService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    ) { }

    async createAdminProfile(adminData: any): Promise<AdminDocument> {
        const admin = new this.adminModel(adminData);
        return admin.save();
    }


    async findByUserId(userId: string): Promise<AdminDocument | null> {
        try {
            const admin = await this.adminModel.findOne({
                userId: new Types.ObjectId(userId)
            }).exec();
            return admin;
        } catch (error) {
            console.error(`Failed to find Admin by userId: ${userId}`, error);
            throw new Error('Could not retrieve admin by userId.');
        }
    }

}