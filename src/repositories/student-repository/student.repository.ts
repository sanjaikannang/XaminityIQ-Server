import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faculty } from 'src/schemas/faculty.schema';
import { Student, StudentDocument } from 'src/schemas/student.schema';
import { Status } from 'src/utils/enum';

@Injectable()
export class StudentRepositoryService {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    ) { }

    async createStudentProfile(studentData: any): Promise<StudentDocument> {
        const student = new this.studentModel(studentData);
        return student.save();
    }

    // Create a new student
    async createUser(studentData: {
        userId: string;
        studentId: string;
        rollNumber: string;
        personalInfo: any;
        contactInfo: any;
        familyInfo: any;
        academicInfo: any;
        status?: Status;
    }): Promise<StudentDocument> {
        const student = new this.studentModel(studentData);
        return student.save();
    }

    // Find student by roll number
    async findByRollNumber(rollNumber: string): Promise<StudentDocument | null> {
        return this.studentModel.findOne({ rollNumber }).exec();
    }

    async findLastStudent(): Promise<Student | null> {
        return this.studentModel
            .findOne({ studentId: { $regex: /^STU\d+$/ } })
            .sort({ studentId: -1 }) // This will sort lexicographically, so we need to sort properly below
            .lean(); // optional if you just want a plain JS object
    }


}