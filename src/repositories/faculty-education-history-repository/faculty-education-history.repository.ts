import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FacultyEducationHistory, FacultyEducationHistoryDocument } from 'src/schemas/User/Faculty/facultyEducationHistory.schema';

@Injectable()
export class FacultyEducationHistoryRepositoryService {
    constructor(
        @InjectModel(FacultyEducationHistory.name) private facultyEducationHistoryModel: Model<FacultyEducationHistoryDocument>
    ) { }

    async create(data: Partial<FacultyEducationHistory>, session?: ClientSession): Promise<FacultyEducationHistoryDocument> {
        try {
            const history = new this.facultyEducationHistoryModel(data);
            return await history.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByFacultyId(facultyId: Types.ObjectId): Promise<FacultyEducationHistoryDocument[]> {
        try {
            return await this.facultyEducationHistoryModel.find({ facultyId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}