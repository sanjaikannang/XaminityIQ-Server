import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StudentAcademicDetail, StudentAcademicDetailDocument } from 'src/schemas/User/Student/studentAcademicDetail.schema';

@Injectable()
export class StudentAcademicDetailRepositoryService {
    constructor(
        @InjectModel(StudentAcademicDetail.name) private studentAcademicDetailModel: Model<StudentAcademicDetailDocument>
    ) { }


    // Create student academic details
    async create(
        data: Partial<StudentAcademicDetail>,
        session?: ClientSession
    ): Promise<StudentAcademicDetailDocument> {
        try {
            const academic = new this.studentAcademicDetailModel(data);
            return await academic.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find academic details by MongoDB ObjectId
    async findById(id: Types.ObjectId): Promise<StudentAcademicDetailDocument | null> {
        try {
            return await this.studentAcademicDetailModel
                .findById(id)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find academic details using roll number
    async findByRollNumber(rollNumber: string): Promise<StudentAcademicDetailDocument | null> {
        try {
            return await this.studentAcademicDetailModel
                .findOne({ rollNumber })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Count students by batch and department
    async countByBatchAndDepartment(
        batchId: Types.ObjectId,
        departmentId: Types.ObjectId
    ): Promise<number> {
        try {
            return await this.studentAcademicDetailModel
                .countDocuments({ batchId, departmentId })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }

}