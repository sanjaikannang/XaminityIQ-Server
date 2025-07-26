import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
        try {
            const student = new this.studentModel(studentData);

            return student.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create user', error);
        }
    }


    // Find student by roll number
    async findByRollNumber(rollNumber: string): Promise<StudentDocument | null> {
        try {
            const user = this.studentModel.findOne({ rollNumber }).exec();

            return user;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find user by rollnumber', error);
        }
    }


    // Find last student
    async findLastStudent(): Promise<Student | null> {
        try {
            const lastStudent = this.studentModel
                .findOne({ studentId: { $regex: /^STU\d+$/ } })
                .sort({ studentId: -1 }) // This will sort lexicographically, so we need to sort properly below
                .lean(); // optional if you just want a plain JS object   

            return lastStudent;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find last student', error);
        }
    }


    // Find by Id
    async findById(id: string): Promise<StudentDocument | null> {
        return await this.studentModel.findById(id).exec();
    }


    // Find By Id and Delete
    async findByIdAndDelete(id: string): Promise<StudentDocument | null> {
        return await this.studentModel.findByIdAndDelete(id).exec();
    }


    // Get All Student
    async getAllStudent(page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            // Get total count
            const totalCount = await this.studentModel.countDocuments().exec();

            // Get students with pagination and population
            const students = await this.studentModel
                .find()
                .populate('userId', '_id email role isActive isEmailVerified lastLogin createdAt')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }) // Sort by newest first
                .exec();

            // Calculate pagination info
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return {
                students,
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage,
                hasPrevPage,
            };
        } catch (error) {
            throw new Error(`Failed to fetch students: ${error.message}`);
        }
    }

}