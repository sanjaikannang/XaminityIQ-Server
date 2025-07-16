import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from 'src/schemas/student.schema';

@Injectable()
export class StudentRepositoryService {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    ) { }

    async createStudentProfile(studentData: any): Promise<StudentDocument> {
        const student = new this.studentModel(studentData);
        return student.save();
    }

}