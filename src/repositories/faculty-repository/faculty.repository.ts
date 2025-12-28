import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Faculty, FacultyDocument } from 'src/schemas/User/Faculty/faculty.schema';

@Injectable()
export class FacultyRepositoryService {
    constructor(
        @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>
    ) { }

    async create(data: Partial<Faculty>, session?: ClientSession): Promise<FacultyDocument> {
        try {
            const faculty = new this.facultyModel(data);
            return await faculty.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findById(id: Types.ObjectId): Promise<FacultyDocument | null> {
        try {
            return await this.facultyModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByUserId(userId: Types.ObjectId): Promise<FacultyDocument | null> {
        try {
            return await this.facultyModel.findOne({ userId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByFacultyId(facultyId: string): Promise<FacultyDocument | null> {
        try {
            return await this.facultyModel.findOne({ facultyId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateById(id: Types.ObjectId, data: Partial<Faculty>, session?: ClientSession): Promise<FacultyDocument | null> {
        try {
            return await this.facultyModel.findByIdAndUpdate(id, data, { new: true, session }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async countFaculty(filter: any = {}): Promise<number> {
        try {
            return await this.facultyModel.countDocuments(filter).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findAllWithDetails(filter: any = {}, skip: number = 0, limit: number = 10): Promise<FacultyDocument[]> {
        try {
            return await this.facultyModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}