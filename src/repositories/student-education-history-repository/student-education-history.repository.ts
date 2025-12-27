import { ClientSession, Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StudentEducationHistory, StudentEducationHistoryDocument } from 'src/schemas/User/Student/studentEducationHistory.schema';

@Injectable()
export class StudentEducationHistoryRepositoryService {
    constructor(
        @InjectModel(StudentEducationHistory.name) private studentEducationHistoryModel: Model<StudentEducationHistoryDocument>
    ) { }


    async create(data: Partial<StudentEducationHistory>, session?: ClientSession): Promise<StudentEducationHistoryDocument> {
        const history = new this.studentEducationHistoryModel(data);
        return await history.save({ session });
    }

    async findByStudentId(studentId: Types.ObjectId): Promise<StudentEducationHistoryDocument[]> {
        return await this.studentEducationHistoryModel.find({ studentId }).exec();
    }

}