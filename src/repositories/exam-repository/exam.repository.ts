import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Exam, ExamDocument } from 'src/schemas/Exam/exam.schema';
import { ExamMode, ExamStatus } from 'src/utils/enum';

const POPULATE_FIELDS = ['batchId', 'courseId', 'departmentId', 'sectionIds', 'subjectId'];

// sectionId/semester below are a single STUDENT's own values — matched
// against the exam's sectionIds/semesters arrays via Mongo's implicit
// scalar-vs-array containment (`{ sectionIds: someId }` matches any document
// whose sectionIds array contains someId, no $in needed).
interface ExamFilters {
    mode?: string;
    status?: string | string[];
    batchId?: string;
    courseId?: string;
    departmentId?: string;
    sectionId?: string;
    semester?: number;
    search?: string;
}

@Injectable()
export class ExamRepositoryService {
    constructor(
        @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    ) { }


    // Create an exam
    async create(data: Partial<Exam>): Promise<ExamDocument> {
        try {
            const exam = new this.examModel(data);
            return await exam.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find an exam by id, with hierarchy refs populated for detail views
    async findById(id: string): Promise<ExamDocument | null> {
        try {
            let query = this.examModel.findOne({ _id: id, isDeleted: false });
            for (const field of POPULATE_FIELDS) {
                query = query.populate(field);
            }
            return await query.exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find an exam by id with raw (unpopulated) hierarchy ObjectId fields
    async findByIdRaw(id: string): Promise<ExamDocument | null> {
        try {
            return await this.examModel.findOne({ _id: id, isDeleted: false }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    private buildFilter(filters: ExamFilters): any {
        const filter: any = { isDeleted: false };
        if (filters.mode) filter.mode = filters.mode;
        if (filters.status) filter.status = Array.isArray(filters.status) ? { $in: filters.status } : filters.status;
        if (filters.batchId) filter.batchId = new Types.ObjectId(filters.batchId);
        if (filters.courseId) filter.courseId = new Types.ObjectId(filters.courseId);
        if (filters.departmentId) filter.departmentId = new Types.ObjectId(filters.departmentId);
        if (filters.sectionId) filter.sectionIds = new Types.ObjectId(filters.sectionId);
        if (filters.semester) filter.semesters = filters.semester;
        if (filters.search && filters.search.trim() !== '') {
            filter.name = { $regex: filters.search, $options: 'i' };
        }
        return filter;
    }


    // Count exams matching filters
    async countWithFilters(filters: ExamFilters): Promise<number> {
        try {
            return await this.examModel.countDocuments(this.buildFilter(filters)).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find exams matching filters, paginated + sorted, hierarchy refs populated
    async findAllWithFilters(
        filters: ExamFilters,
        skip: number,
        limit: number,
        sortBy?: string,
        sortOrder: 'asc' | 'desc' = 'desc',
    ): Promise<ExamDocument[]> {
        try {
            const sortField = sortBy || 'createdAt';
            const direction = sortOrder === 'asc' ? 1 : -1;
            let query = this.examModel
                .find(this.buildFilter(filters))
                .sort({ [sortField]: direction })
                .skip(skip)
                .limit(limit);
            for (const field of POPULATE_FIELDS) {
                query = query.populate(field);
            }
            return await query.exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Update an exam
    async updateById(id: string, data: Partial<Exam>): Promise<ExamDocument | null> {
        try {
            return await this.examModel.findByIdAndUpdate(id, data, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Soft-delete (cancel) an exam
    async softDeleteById(id: string): Promise<ExamDocument | null> {
        try {
            return await this.examModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find every non-deleted exam in any of the given statuses — used by the lifecycle sweep
    async findAllByStatuses(statuses: string[]): Promise<ExamDocument[]> {
        try {
            return await this.examModel.find({ status: { $in: statuses }, isDeleted: false }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find every exam a given faculty is an assigned evaluator for, in any of the given statuses
    async findByEvaluatorFacultyId(facultyId: string, statuses: string[]): Promise<ExamDocument[]> {
        try {
            return await this.examModel
                .find({
                    evaluatorFacultyIds: new Types.ObjectId(facultyId),
                    status: { $in: statuses },
                    isDeleted: false,
                })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find every PUBLISHED PROCTORING exam sharing the exact same schedule window —
    // the sibling lookup for Dynamic Room Allocation pooling
    async findMatchingProctoringWindow(
        startDate: Date,
        endDate: Date,
        startTime?: string,
        endTime?: string,
    ): Promise<ExamDocument[]> {
        try {
            return await this.examModel
                .find({
                    mode: ExamMode.PROCTORING,
                    status: ExamStatus.PUBLISHED,
                    startDate,
                    endDate,
                    startTime,
                    endTime,
                    isDeleted: false,
                })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
