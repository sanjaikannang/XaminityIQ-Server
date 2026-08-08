import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExamQuestion, ExamQuestionDocument } from 'src/schemas/Exam/examQuestion.schema';

@Injectable()
export class ExamQuestionRepositoryService {
    constructor(
        @InjectModel(ExamQuestion.name) private examQuestionModel: Model<ExamQuestionDocument>,
    ) { }


    // Create a question
    async create(data: Partial<ExamQuestion>): Promise<ExamQuestionDocument> {
        try {
            const question = new this.examQuestionModel(data);
            return await question.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find a question by id
    async findById(id: string): Promise<ExamQuestionDocument | null> {
        try {
            return await this.examQuestionModel.findOne({ _id: id, isDeleted: false }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find all active questions for an exam, in authoring order
    async findByExamId(examId: string): Promise<ExamQuestionDocument[]> {
        try {
            return await this.examQuestionModel
                .find({ examId: new Types.ObjectId(examId), isDeleted: false })
                .sort({ order: 1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Count active questions for an exam
    async countByExamId(examId: string): Promise<number> {
        try {
            return await this.examQuestionModel
                .countDocuments({ examId: new Types.ObjectId(examId), isDeleted: false })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Sum of marks across all active questions for an exam (publish-time totalMarks validation)
    async sumMarksByExamId(examId: string): Promise<number> {
        try {
            const result = await this.examQuestionModel.aggregate([
                { $match: { examId: new Types.ObjectId(examId), isDeleted: false } },
                { $group: { _id: null, total: { $sum: '$marks' } } },
            ]).exec();
            return result[0]?.total || 0;
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Next authoring-order value for a new question in this exam
    async getNextOrder(examId: string): Promise<number> {
        try {
            const last = await this.examQuestionModel
                .findOne({ examId: new Types.ObjectId(examId), isDeleted: false })
                .sort({ order: -1 })
                .exec();
            return (last?.order || 0) + 1;
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Update a question
    async updateById(id: string, data: Partial<ExamQuestion>): Promise<ExamQuestionDocument | null> {
        try {
            return await this.examQuestionModel.findByIdAndUpdate(id, data, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Soft-delete a question
    async softDeleteById(id: string): Promise<ExamQuestionDocument | null> {
        try {
            return await this.examQuestionModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
