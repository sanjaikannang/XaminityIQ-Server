import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FacultyWorkExperience, FacultyWorkExperienceDocument } from 'src/schemas/User/Faculty/facultyWorkExperience.schema';

@Injectable()
export class FacultyWorkExperienceRepositoryService {
    constructor(
        @InjectModel(FacultyWorkExperience.name) private facultyWorkExperienceModel: Model<FacultyWorkExperienceDocument>
    ) { }

    async create(data: Partial<FacultyWorkExperience>, session?: ClientSession): Promise<FacultyWorkExperienceDocument> {
        try {
            const work = new this.facultyWorkExperienceModel(data);
            return await work.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByFacultyId(facultyId: Types.ObjectId): Promise<FacultyWorkExperienceDocument[]> {
        try {
            return await this.facultyWorkExperienceModel.find({ facultyId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}