import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FacultyPersonalDetail, FacultyPersonalDetailDocument } from 'src/schemas/User/Faculty/facultyPersonalDetail.schema';

@Injectable()
export class FacultyPersonalDetailRepositoryService {
    constructor(
        @InjectModel(FacultyPersonalDetail.name) private facultyPersonalDetailModel: Model<FacultyPersonalDetailDocument>
    ) { }

    async create(data: Partial<FacultyPersonalDetail>, session?: ClientSession): Promise<FacultyPersonalDetailDocument> {
        try {
            const detail = new this.facultyPersonalDetailModel(data);
            return await detail.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findById(id: Types.ObjectId): Promise<FacultyPersonalDetailDocument | null> {
        try {
            return await this.facultyPersonalDetailModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}