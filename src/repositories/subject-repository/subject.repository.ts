import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Subject, SubjectDocument } from 'src/schemas/Academic/subject.schema';

@Injectable()
export class SubjectRepositoryService {
    constructor(
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    ) { }


    // Create a subject
    async create(data: {
        departmentId: Types.ObjectId;
        semester: number;
        subjectCode: string;
        subjectName: string;
        credits: number;
        subjectType: string;
        description?: string;
        createdBy: Types.ObjectId;
    }): Promise<SubjectDocument> {
        try {
            const subject = new this.subjectModel(data);
            return await subject.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find subject by id
    async findById(id: string): Promise<SubjectDocument | null> {
        try {
            return await this.subjectModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find an active subject by its unique code
    async findByCode(subjectCode: string): Promise<SubjectDocument | null> {
        try {
            return await this.subjectModel.findOne({ subjectCode, isActive: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Count active subjects for a department+semester (used to enforce the 6-subject cap)
    async countByDepartmentAndSemester(
        departmentId: Types.ObjectId,
        semester: number,
        excludeId?: string,
    ): Promise<number> {
        try {
            const filter: any = { departmentId, semester, isActive: true };
            if (excludeId) {
                filter._id = { $ne: new Types.ObjectId(excludeId) };
            }
            return await this.subjectModel.countDocuments(filter).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find active subjects for a department+semester (student's own-subjects view)
    async findByDepartmentAndSemester(departmentId: Types.ObjectId, semester: number): Promise<SubjectDocument[]> {
        try {
            return await this.subjectModel
                .find({ departmentId, semester, isActive: true })
                .sort({ subjectCode: 1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find active subjects for a department, optionally scoped to a semester (HOD's own-department view)
    async findByDepartment(
        departmentId: Types.ObjectId,
        filters: { semester?: number },
        skip: number,
        limit: number,
        sortBy?: string,
        sortOrder: 'asc' | 'desc' = 'asc',
    ): Promise<SubjectDocument[]> {
        try {
            const filter: any = { departmentId, isActive: true };
            if (filters.semester) {
                filter.semester = filters.semester;
            }
            const sortField = sortBy || 'subjectCode';
            const direction = sortOrder === 'asc' ? 1 : -1;
            return await this.subjectModel
                .find(filter)
                .sort({ [sortField]: direction })
                .skip(skip)
                .limit(limit)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Count active subjects for a department, optionally scoped to a semester
    async countByDepartment(departmentId: Types.ObjectId, filters: { semester?: number }): Promise<number> {
        try {
            const filter: any = { departmentId, isActive: true };
            if (filters.semester) {
                filter.semester = filters.semester;
            }
            return await this.subjectModel.countDocuments(filter).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find all active subjects across departments (admin read-only view)
    async findAll(
        filters: { departmentId?: string; semester?: number },
        skip: number,
        limit: number,
        sortBy?: string,
        sortOrder: 'asc' | 'desc' = 'desc',
    ): Promise<SubjectDocument[]> {
        try {
            const filter: any = { isActive: true };
            if (filters.departmentId) {
                filter.departmentId = new Types.ObjectId(filters.departmentId);
            }
            if (filters.semester) {
                filter.semester = filters.semester;
            }
            const sortField = sortBy || 'createdAt';
            const direction = sortOrder === 'asc' ? 1 : -1;
            return await this.subjectModel
                .find(filter)
                .populate('departmentId')
                .sort({ [sortField]: direction })
                .skip(skip)
                .limit(limit)
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Count all active subjects across departments, matching the same filters as findAll
    async countAll(filters: { departmentId?: string; semester?: number }): Promise<number> {
        try {
            const filter: any = { isActive: true };
            if (filters.departmentId) {
                filter.departmentId = new Types.ObjectId(filters.departmentId);
            }
            if (filters.semester) {
                filter.semester = filters.semester;
            }
            return await this.subjectModel.countDocuments(filter).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Update a subject
    async updateById(id: string, data: Partial<Subject>): Promise<SubjectDocument | null> {
        try {
            return await this.subjectModel.findByIdAndUpdate(id, data, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Soft-delete a subject
    async softDeleteById(id: string): Promise<SubjectDocument | null> {
        try {
            return await this.subjectModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}
