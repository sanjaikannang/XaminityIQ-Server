import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StudentAddressDetail, StudentAddressDetailDocument } from 'src/schemas/User/Student/studentAddressDetail.schema';

@Injectable()
export class StudentAddressDetailRepositoryService {
    constructor(
        @InjectModel(StudentAddressDetail.name) private studentAddressDetailModel: Model<StudentAddressDetailDocument>
    ) { }


    // Create student address details
    async create(
        data: Partial<StudentAddressDetail>,
        session?: ClientSession
    ): Promise<StudentAddressDetailDocument> {
        try {
            const address = new this.studentAddressDetailModel(data);
            return await address.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find student address details by MongoDB ObjectId
    async findById(id: Types.ObjectId): Promise<StudentAddressDetailDocument | null> {
        try {
            return await this.studentAddressDetailModel
                .findById(id)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


}