import { Model } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BatchDepartment, BatchDepartmentDocument } from 'src/schemas/Academic/batchDepartment.schema';

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


    // Count departments for a batch course
    async countDepartmentsForBatchCourse(batchCourseId: string, departmentFilter: any): Promise<number> {
        const results = await this.batchDepartmentModel
            .find({ batchCourseId })
            .populate({
                path: 'deptId',
                match: departmentFilter
            })
            .exec();

        // Filter out null deptId (didn't match the search)
        return results.filter(item => item.deptId !== null).length;
    }


    // Find departments for a batch course
    async findDepartmentsForBatchCourseWithPagination(
        batchCourseId: string,
        departmentFilter: any,
        skip: number,
        limit: number,
        sortBy?: string,
        sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        const results = await this.batchDepartmentModel
            .find({ batchCourseId })
            .populate({
                path: 'deptId',
                match: departmentFilter
            })
            .exec();

        // Filter out null deptId, then sort in-memory (dept name/code live on the
        // populated doc, totalSeats/sectionCapacity/createdAt on the junction itself)
        const filtered = results.filter(item => item.deptId !== null);

        const deptFields = new Set(['deptName', 'deptCode']);
        const field = sortBy || 'createdAt';
        const direction = sortOrder === 'asc' ? 1 : -1;
        filtered.sort((a: any, b: any) => {
            const aValue = deptFields.has(field) ? a.deptId?.[field] : a[field];
            const bValue = deptFields.has(field) ? b.deptId?.[field] : b[field];
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;
            if (aValue < bValue) return -direction;
            if (aValue > bValue) return direction;
            return 0;
        });

        // Apply pagination manually (post-filter, post-sort)
        return filtered.slice(skip, skip + limit);
    }


}