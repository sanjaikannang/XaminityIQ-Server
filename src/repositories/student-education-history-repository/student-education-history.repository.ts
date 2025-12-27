import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StudentEducationHistory, StudentEducationHistoryDocument } from 'src/schemas/User/Student/studentEducationHistory.schema';

@Injectable()
export class StudentEducationHistoryRepositoryService {
    constructor(
        @InjectModel(StudentEducationHistory.name) private studentEducationHistoryModel: Model<StudentEducationHistoryDocument>
    ) { }


    // Create student education history record
    async create(
        data: Partial<StudentEducationHistory>,
        session?: ClientSession
    ): Promise<StudentEducationHistoryDocument> {
        try {
            const history = new this.studentEducationHistoryModel(data);
            return await history.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find all education history records for a student
    async findByStudentId(studentId: Types.ObjectId): Promise<StudentEducationHistoryDocument[]> {
        try {
            return await this.studentEducationHistoryModel
                .find({ studentId })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }

}