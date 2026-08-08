import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExamAttempt, ExamAttemptDocument } from 'src/schemas/Exam/examAttempt.schema';

@Injectable()
export class ExamAttemptRepositoryService {
    constructor(
        @InjectModel(ExamAttempt.name) private examAttemptModel: Model<ExamAttemptDocument>,
    ) { }


    // Create an attempt
    async create(data: Partial<ExamAttempt>): Promise<ExamAttemptDocument> {
        try {
            const attempt = new this.examAttemptModel(data);
            return await attempt.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find an attempt by id
    async findById(id: string): Promise<ExamAttemptDocument | null> {
        try {
            return await this.examAttemptModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find a student's attempt for an exam (at most one, per the unique index)
    async findByExamAndStudent(examId: string, studentId: string): Promise<ExamAttemptDocument | null> {
        try {
            return await this.examAttemptModel
                .findOne({ examId: new Types.ObjectId(examId), studentId: new Types.ObjectId(studentId) })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find every attempt a student has across a set of exams (batched, for "My Exams" status annotation)
    async findByStudentAndExamIds(studentId: string, examIds: string[]): Promise<ExamAttemptDocument[]> {
        try {
            return await this.examAttemptModel
                .find({
                    studentId: new Types.ObjectId(studentId),
                    examId: { $in: examIds.map((id) => new Types.ObjectId(id)) },
                })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Update an attempt
    async updateById(id: string, data: Partial<ExamAttempt>): Promise<ExamAttemptDocument | null> {
        try {
            return await this.examAttemptModel.findByIdAndUpdate(id, data, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
