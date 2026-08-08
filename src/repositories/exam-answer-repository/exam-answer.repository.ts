import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExamAnswer, ExamAnswerDocument } from 'src/schemas/Exam/examAnswer.schema';

@Injectable()
export class ExamAnswerRepositoryService {
    constructor(
        @InjectModel(ExamAnswer.name) private examAnswerModel: Model<ExamAnswerDocument>,
    ) { }


    // Seed one empty answer row per question when an attempt starts
    async createMany(data: Array<{ attemptId: Types.ObjectId; questionId: Types.ObjectId }>): Promise<void> {
        try {
            await this.examAnswerModel.insertMany(data);
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find every answer row for an attempt
    async findByAttemptId(attemptId: string): Promise<ExamAnswerDocument[]> {
        try {
            return await this.examAnswerModel
                .find({ attemptId: new Types.ObjectId(attemptId) })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find a single attempt+question answer row
    async findByAttemptAndQuestion(attemptId: string, questionId: string): Promise<ExamAnswerDocument | null> {
        try {
            return await this.examAnswerModel
                .findOne({ attemptId: new Types.ObjectId(attemptId), questionId: new Types.ObjectId(questionId) })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Upsert an MCQ/MSQ selection onto the pre-seeded answer row
    async upsertAnswer(
        attemptId: string,
        questionId: string,
        data: { selectedOptionId?: string; selectedOptionIds?: string[] },
    ): Promise<ExamAnswerDocument | null> {
        try {
            return await this.examAnswerModel
                .findOneAndUpdate(
                    { attemptId: new Types.ObjectId(attemptId), questionId: new Types.ObjectId(questionId) },
                    data,
                    { new: true },
                )
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
