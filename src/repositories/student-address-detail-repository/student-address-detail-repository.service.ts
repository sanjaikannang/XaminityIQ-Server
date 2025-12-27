import { ClientSession, Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StudentAddressDetail, StudentAddressDetailDocument } from 'src/schemas/User/Student/studentAddressDetail.schema';

@Injectable()
export class StudentAddressDetailRepositoryService {
    constructor(
        @InjectModel(StudentAddressDetail.name) private studentAddressDetailModel: Model<StudentAddressDetailDocument>
    ) { }


    async create(data: Partial<StudentAddressDetail>, session?: ClientSession): Promise<StudentAddressDetailDocument> {
        const address = new this.studentAddressDetailModel(data);
        return await address.save({ session });
    }

    async findById(id: Types.ObjectId): Promise<StudentAddressDetailDocument | null> {
        return await this.studentAddressDetailModel.findById(id).exec();
    }


}