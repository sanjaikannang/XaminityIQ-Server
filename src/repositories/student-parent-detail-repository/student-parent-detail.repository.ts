import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StudentParentDetail, StudentParentDetailDocument } from 'src/schemas/User/Student/studentParentDetail.schema';

@Injectable()
export class StudentParentDetailRepositoryService {
    constructor(
        @InjectModel(StudentParentDetail.name) private studentParentDetailModel: Model<StudentParentDetailDocument>
    ) { }


    // Create student parent details
    async create(
        data: Partial<StudentParentDetail>,
        session?: ClientSession
    ): Promise<StudentParentDetailDocument> {
        try {
            const parent = new this.studentParentDetailModel(data);
            return await parent.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find parent details using studentId reference
    async findByStudentId(studentId: Types.ObjectId): Promise<StudentParentDetailDocument | null> {
        try {
            return await this.studentParentDetailModel
                .findOne({ studentId })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }

}