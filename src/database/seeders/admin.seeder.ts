import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { Admin, AdminDocument } from '../../schemas/admin.schema';
import { UserRole } from '../../utils/enum';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class AdminSeeder {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        private readonly configService: ConfigService,
    ) { }

    async seed(): Promise<void> {
        try {
            // Check if admin user already exists
            const existingAdmin = await this.userModel.findOne({
                role: UserRole.ADMIN
            }).exec();

            if (existingAdmin) {
                console.log('Admin user already exists. Skipping seed.');
                return;
            }

            // Create admin user
            const adminEmail = this.configService.getInitialAdminEmail();
            const adminPassword = this.configService.getInitialAdminPassword();

            // Hash the password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

            // Create user record
            const adminUser = new this.userModel({
                email: adminEmail,
                password: hashedPassword,
                role: UserRole.ADMIN,
                isActive: true,
                isEmailVerified: true,
                isFirstLogin: true, // Force password change on first login
                isPasswordReset: false,
                lastPasswordChange: new Date(),
            });

            const savedUser = await adminUser.save();

            // Create admin profile
            const adminProfile = new this.adminModel({
                userId: savedUser._id,
                name: {
                    firstName: 'System',
                    lastName: 'Administrator'
                },
                contactInfo: {
                    phone: '1234567890',
                    address: {
                        street: '123 MG Road',
                        city: 'Bangalore',
                        state: 'Karnataka',
                        zipCode: '560001',
                        country: 'INDIA'
                    }
                }
            });

            await adminProfile.save();

            console.log(`Admin user created successfully!`);
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
            console.log(`Please change the password on first login!`);

        } catch (error) {
            console.error('Error creating admin user:', error.message);
            throw error;
        }
    }

    async drop(): Promise<void> {
        try {
            // Find and delete admin records
            const adminUser = await this.userModel.findOne({
                role: UserRole.ADMIN
            }).exec();

            if (adminUser) {
                await this.adminModel.deleteOne({ userId: adminUser._id }).exec();
                await this.userModel.deleteOne({ _id: adminUser._id }).exec();
                console.log('Admin user removed successfully!');
            } else {
                console.log('No admin user found to remove.');
            }
        } catch (error) {
            console.error('Error removing admin user:', error.message);
            throw error;
        }
    }
}