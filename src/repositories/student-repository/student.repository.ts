import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Student, StudentDocument } from 'src/schemas/User/Student/student.schema';

@Injectable()
export class StudentRepositoryService {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>
    ) { }


    async create(data: Partial<Student>, session?: ClientSession): Promise<StudentDocument> {
        const student = new this.studentModel(data);
        return await student.save({ session });
    }

    async findById(id: Types.ObjectId): Promise<StudentDocument | null> {
        return await this.studentModel.findById(id).exec();
    }

    async findByUserId(userId: Types.ObjectId): Promise<StudentDocument | null> {
        return await this.studentModel.findOne({ userId }).exec();
    }

    async findByStudentId(studentId: string): Promise<StudentDocument | null> {
        return await this.studentModel.findOne({ studentId }).exec();
    }

    async updateById(id: Types.ObjectId, data: Partial<Student>, session?: ClientSession): Promise<StudentDocument | null> {
        return await this.studentModel.findByIdAndUpdate(id, data, { new: true, session }).exec();
    }

}