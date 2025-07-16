import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

}