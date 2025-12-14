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


    // Count courses for a batch
    async countCoursesForBatch(batchId: string, courseFilter: any): Promise<number> {
        return this.batchCourseModel
            .countDocuments({ batchId })
            .populate({
                path: 'courseId',
                match: courseFilter
            })
            .exec()
            .then(async () => {
                // Need to actually populate and filter to get accurate count
                const results = await this.batchCourseModel
                    .find({ batchId })
                    .populate({
                        path: 'courseId',
                        match: courseFilter
                    })
                    .exec();

                // Filter out null courseId (didn't match the search)
                return results.filter(item => item.courseId !== null).length;
            });
    }


    // Find courses for a batch
    async findCoursesForBatchWithPagination(
        batchId: string,
        courseFilter: any,
        skip: number,
        limit: number
    ) {
        const results = await this.batchCourseModel
            .find({ batchId })
            .populate({
                path: 'courseId',
                match: courseFilter
            })
            .sort({ createdAt: -1 })
            .exec();

        // Filter out null courseId and apply pagination manually
        const filtered = results.filter(item => item.courseId !== null);
        return filtered.slice(skip, skip + limit);
    }


}