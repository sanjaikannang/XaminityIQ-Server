import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { StudentAcademicDetail, StudentAcademicDetailDocument } from 'src/schemas/User/Student/studentAcademicDetail.schema';

@Injectable()
export class StudentAcademicDetailRepositoryService {
    constructor(
        @InjectModel(StudentAcademicDetail.name) private studentAcademicDetailModel: Model<StudentAcademicDetailDocument>
    ) { }

    async create(data: Partial<StudentAcademicDetail>, session?: ClientSession): Promise<StudentAcademicDetailDocument> {
        const academic = new this.studentAcademicDetailModel(data);
        return await academic.save({ session });
    }

    async findById(id: Types.ObjectId): Promise<StudentAcademicDetailDocument | null> {
        return await this.studentAcademicDetailModel.findById(id).exec();
    }

    async findByRollNumber(rollNumber: string): Promise<StudentAcademicDetailDocument | null> {
        return await this.studentAcademicDetailModel.findOne({ rollNumber }).exec();
    }

    async countByBatchAndDepartment(batchId: Types.ObjectId, departmentId: Types.ObjectId): Promise<number> {
        return await this.studentAcademicDetailModel.countDocuments({ batchId, departmentId }).exec();
    }

}