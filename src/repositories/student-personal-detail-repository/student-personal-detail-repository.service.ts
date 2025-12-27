import { ClientSession, Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StudentPersonalDetail, StudentPersonalDetailDocument } from 'src/schemas/User/Student/studentPersonalDetails.schema';

@Injectable()
export class StudentPersonalDetailRepositoryService {
    constructor(
        @InjectModel(StudentPersonalDetail.name) private studentPersonalDetailModel: Model<StudentPersonalDetailDocument>
    ) { }


    async create(data: Partial<StudentPersonalDetail>, session?: ClientSession): Promise<StudentPersonalDetailDocument> {
        const detail = new this.studentPersonalDetailModel(data);
        return await detail.save({ session });
    }

    async findById(id: Types.ObjectId): Promise<StudentPersonalDetailDocument | null> {
        return await this.studentPersonalDetailModel.findById(id).exec();
    }

}