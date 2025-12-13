import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BatchCourse, BatchCourseDocument } from 'src/schemas/batchCourse.schema';

@Injectable()
export class BatchCourseRepositoryService {
    constructor(
        @InjectModel(BatchCourse.name) private batchCourseModel: Model<BatchCourseDocument>,
    ) { }


    // Find batch-course by ID
    async findById(batchCourseId: string): Promise<BatchCourseDocument | null> {
        try {
            return this.batchCourseModel.findById(batchCourseId).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find existing batch-course mapping
    async findByBatchAndCourse(batchId: string, courseId: string): Promise<BatchCourseDocument | null> {
        try {
            return this.batchCourseModel.findOne({ batchId, courseId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Create new batch-course mapping
    async create(data: {
        batchId: string;
        courseId: string;
    }): Promise<BatchCourseDocument> {
        try {
            const batchCourse = new this.batchCourseModel(data);
            return batchCourse.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


}