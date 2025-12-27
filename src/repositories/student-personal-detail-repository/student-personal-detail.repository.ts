import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StudentPersonalDetail, StudentPersonalDetailDocument } from 'src/schemas/User/Student/studentPersonalDetails.schema';

@Injectable()
export class StudentPersonalDetailRepositoryService {
    constructor(
        @InjectModel(StudentPersonalDetail.name) private studentPersonalDetailModel: Model<StudentPersonalDetailDocument>
    ) { }


    // Create student personal details
    async create(
        data: Partial<StudentPersonalDetail>,
        session?: ClientSession
    ): Promise<StudentPersonalDetailDocument> {
        try {
            const detail = new this.studentPersonalDetailModel(data);
            return await detail.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find student personal details by MongoDB ObjectId
    async findById(id: Types.ObjectId): Promise<StudentPersonalDetailDocument | null> {
        try {
            return await this.studentPersonalDetailModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }

}