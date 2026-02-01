import { Model, Types } from 'mongoose';
import { ExamMode, ExamStatus } from 'src/utils/enum';
import { InjectModel } from '@nestjs/mongoose';
import { Exam, ExamDocument } from 'src/schemas/Exam/exam.schema';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ExamRepositoryService {
    constructor(
        @InjectModel(Exam.name) private examModel: Model<ExamDocument>
    ) { }

    async findById(examId: string): Promise<ExamDocument | null> {
        try {
            return this.examModel.findById(examId).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async create(examData: {
        examMode: ExamMode;
        examName: string;
        duration: number;
        agoraChannelName: string;
        createdBy: Types.ObjectId;
        examDate?: Date;
        startTime?: string;
        endTime?: string;
        examStartDate?: Date;
        examEndDate?: Date;
        faculty?: Types.ObjectId | null;
        students?: Types.ObjectId[];
    }): Promise<ExamDocument> {
        try {
            const exam = new this.examModel(examData);
            return exam.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateStatus(examId: string, status: ExamStatus): Promise<ExamDocument | null> {
        try {
            console.log('Repository - Updating exam:', examId, 'to status:', status);
            const result = await this.examModel.findByIdAndUpdate(
                examId,
                { status },
                { new: true }
            ).exec();

            return result;
            console.log("result", result);
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findAll(filter: any = {}): Promise<ExamDocument[]> {
        try {
            return this.examModel.find(filter).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateStartTime(examId: string, startedAt: Date): Promise<ExamDocument | null> {
        try {
            return this.examModel.findByIdAndUpdate(
                examId,
                { startedAt, status: ExamStatus.ONGOING },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateEndTime(examId: string, endedAt: Date): Promise<ExamDocument | null> {
        try {
            return this.examModel.findByIdAndUpdate(
                examId,
                { endedAt, status: ExamStatus.COMPLETED },
                { new: true }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByFaculty(facultyId: string, status?: ExamStatus): Promise<ExamDocument[]> {
        try {
            const filter: any = { createdBy: new Types.ObjectId(facultyId) };
            if (status) {
                filter.status = status;
            }
            return this.examModel.find(filter).sort({ date: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async countDocuments(filter: any): Promise<number> {
        try {
            return this.examModel.countDocuments(filter).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findWithPagination(
        filter: any,
        skip: number,
        limit: number
    ): Promise<ExamDocument[]> {
        try {
            return this.examModel
                .find(filter)
                .populate('faculty', 'firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}