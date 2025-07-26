import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faculty, FacultyDocument } from 'src/schemas/faculty.schema';
import { Status } from 'src/utils/enum';

@Injectable()
export class FacultyRepositoryService {
    constructor(
        @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
    ) { }


    // Create Faculty User
    async createUser(facultyData: {
        userId: string;
        facultyId: string;
        personalInfo: any;
        contactInfo: any;
        professionalInfo: any;
        joiningDate?: Date;
        status?: Status;
    }): Promise<FacultyDocument> {
        const faculty = new this.facultyModel(facultyData);
        return faculty.save();
    }


    // Find Last Faculty
    async findLastFaculty(): Promise<Faculty | null> {
        return this.facultyModel
            .findOne({ facultyId: { $regex: /^FAC\d+$/ } })
            .sort({ facultyId: -1 }) // This will sort lexicographically, so we need to sort properly below
            .lean(); // optional if you just want a plain JS object
    }


    async findById(id: string): Promise<FacultyDocument | null> {
        return await this.facultyModel.findById(id).exec();
    }

    async findByIdAndDelete(id: string): Promise<FacultyDocument | null> {
        return await this.facultyModel.findByIdAndDelete(id).exec();
    }

    async findByUserId(userId: string): Promise<FacultyDocument | null> {
        return await this.facultyModel.findOne({ userId }).exec();
    }

    async deleteByUserId(userId: string): Promise<FacultyDocument | null> {
        return await this.facultyModel.findOneAndDelete({ userId }).exec();
    }


    // Get All Faculty
    async getAllFaculty(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        try {
            // Get paginated faculty data with user information
            const faculty = await this.facultyModel
                .find()
                .populate({
                    path: 'userId',
                    select: 'email role isActive isEmailVerified lastLogin createdAt'
                })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean()
                .exec();

            // Get total count for pagination
            const totalCount = await this.facultyModel.countDocuments().exec();

            const totalPages = Math.ceil(totalCount / limit);

            return {
                faculty,
                totalCount,
                currentPage: page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            };
        } catch (error) {
            throw new Error(`Failed to fetch faculty data: ${error.message}`);
        }
    }


}