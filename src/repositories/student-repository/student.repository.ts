import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Student, StudentDocument } from 'src/schemas/User/Student/student.schema';

@Injectable()
export class StudentRepositoryService {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>
    ) { }


    // Create a new student document
    async create(
        data: Partial<Student>,
        session?: ClientSession
    ): Promise<StudentDocument> {
        try {
            const student = new this.studentModel(data);
            return await student.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find a student by MongoDB ObjectId
    async findById(id: Types.ObjectId): Promise<StudentDocument | null> {
        try {
            return await this.studentModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find a student using the related userId
    async findByUserId(userId: Types.ObjectId): Promise<StudentDocument | null> {
        try {
            return await this.studentModel.findOne({ userId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find a student by custom studentId
    async findByStudentId(studentId: string): Promise<StudentDocument | null> {
        try {
            return await this.studentModel.findOne({ studentId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Update student data by MongoDB ObjectId
    async updateById(
        id: Types.ObjectId,
        data: Partial<Student>,
        session?: ClientSession
    ): Promise<StudentDocument | null> {
        try {
            return await this.studentModel
                .findByIdAndUpdate(id, data, { new: true, session })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Count Students
    async countStudents(filter: any = {}): Promise<number> {
        try {
            return await this.studentModel.countDocuments(filter).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find All Students with all Details
    async findAllWithDetails(filter: any = {}, skip: number = 0, limit: number = 10): Promise<StudentDocument[]> {
        try {
            return await this.studentModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}