import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FacultyEmploymentDetail, FacultyEmploymentDetailDocument } from 'src/schemas/User/Faculty/facultyEmploymentDetail.schema';

@Injectable()
export class FacultyEmploymentDetailRepositoryService {
    constructor(
        @InjectModel(FacultyEmploymentDetail.name) private facultyEmploymentDetailModel: Model<FacultyEmploymentDetailDocument>
    ) { }

    async create(data: Partial<FacultyEmploymentDetail>, session?: ClientSession): Promise<FacultyEmploymentDetailDocument> {
        try {
            const employment = new this.facultyEmploymentDetailModel(data);
            return await employment.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findById(id: Types.ObjectId): Promise<FacultyEmploymentDetailDocument | null> {
        try {
            return await this.facultyEmploymentDetailModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByEmployeeId(employeeId: string): Promise<FacultyEmploymentDetailDocument | null> {
        try {
            return await this.facultyEmploymentDetailModel.findOne({ employeeId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}