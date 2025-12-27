import { ClientSession, Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StudentParentDetail, StudentParentDetailDocument } from 'src/schemas/User/Student/studentParentDetail.schema';

@Injectable()
export class StudentParentDetailRepositoryService {
    constructor(
        @InjectModel(StudentParentDetail.name) private studentParentDetailModel: Model<StudentParentDetailDocument>
    ) { }

    async create(data: Partial<StudentParentDetail>, session?: ClientSession): Promise<StudentParentDetailDocument> {
        const parent = new this.studentParentDetailModel(data);
        return await parent.save({ session });
    }

    async findByStudentId(studentId: Types.ObjectId): Promise<StudentParentDetailDocument | null> {
        return await this.studentParentDetailModel.findOne({ studentId }).exec();
    }

}