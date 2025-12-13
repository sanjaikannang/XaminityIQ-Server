import { Model } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BatchDepartment, BatchDepartmentDocument } from 'src/schemas/batchDepartment.schema';

@Injectable()
export class BatchDepartmentRepositoryService {
    constructor(
        @InjectModel(BatchDepartment.name) private batchDepartmentModel: Model<BatchDepartmentDocument>,
    ) { }


    // Find existing batch-department mapping
    async findByBatchCourseAndDept(batchCourseId: string, deptId: string): Promise<BatchDepartmentDocument | null> {
        try {
            return this.batchDepartmentModel.findOne({ batchCourseId, deptId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Create new batch-department mapping
    async create(data: {
        batchCourseId: string;
        courseId: string;
        deptId: string;
        totalSeats: number;
        sectionCapacity: number;
    }): Promise<BatchDepartmentDocument> {
        try {
            const batchDepartment = new this.batchDepartmentModel(data);
            return batchDepartment.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


}