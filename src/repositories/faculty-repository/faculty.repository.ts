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


}