import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Faculty, FacultyDocument } from 'src/schemas/User/Faculty/faculty.schema';
import { FacultyEmploymentDetail, FacultyEmploymentDetailDocument } from 'src/schemas/User/Faculty/facultyEmploymentDetail.schema';
import { FacultyPersonalDetail, FacultyPersonalDetailDocument } from 'src/schemas/User/Faculty/facultyPersonalDetail.schema';

@Injectable()
export class FacultyRepositoryService {
    constructor(
        @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
        @InjectModel(FacultyEmploymentDetail.name) private facultyEmploymentDetailModel: Model<FacultyEmploymentDetailDocument>,
        @InjectModel(FacultyPersonalDetail.name) private facultyPersonalDetailModel: Model<FacultyPersonalDetailDocument>,
    ) { }

    async create(data: Partial<Faculty>, session?: ClientSession): Promise<FacultyDocument> {
        try {
            const faculty = new this.facultyModel(data);
            return await faculty.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findById(id: Types.ObjectId): Promise<FacultyDocument | null> {
        try {
            return await this.facultyModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByUserId(userId: Types.ObjectId): Promise<FacultyDocument | null> {
        try {
            return await this.facultyModel.findOne({ userId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findByFacultyId(facultyId: string): Promise<FacultyDocument | null> {
        try {
            return await this.facultyModel.findOne({ facultyId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async updateById(id: Types.ObjectId, data: Partial<Faculty>, session?: ClientSession): Promise<FacultyDocument | null> {
        try {
            return await this.facultyModel.findByIdAndUpdate(id, data, { new: true, session }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async countFaculty(filter: any = {}): Promise<number> {
        try {
            return await this.facultyModel.countDocuments(filter).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

    async findAllWithDetails(filter: any = {}, skip: number = 0, limit: number = 10): Promise<FacultyDocument[]> {
        try {
            return await this.facultyModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Count faculty matching a base filter (on Faculty) plus an employment-detail filter (department/designation/employmentType/status)
    async countWithEmploymentFilter(baseFilter: any, employmentFilter: any): Promise<number> {
        try {
            const pipeline: any[] = [
                { $match: baseFilter },
                {
                    $lookup: {
                        from: this.facultyEmploymentDetailModel.collection.name,
                        localField: 'employmentDetailId',
                        foreignField: '_id',
                        as: 'employmentDetail',
                    },
                },
                { $unwind: '$employmentDetail' },
            ];

            if (Object.keys(employmentFilter).length > 0) {
                pipeline.push({ $match: employmentFilter });
            }

            pipeline.push({ $count: 'total' });

            const result = await this.facultyModel.aggregate(pipeline).exec();
            return result[0]?.total || 0;
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find faculty ids matching filter + employment filter, sorted, for a page (order-preserving)
    async findIdsWithEmploymentFilterSorted(
        baseFilter: any,
        employmentFilter: any,
        sortField: string,
        sortOrder: 'asc' | 'desc',
        skip: number,
        limit: number
    ): Promise<Types.ObjectId[]> {
        try {
            const sortFieldMap: Record<string, string> = {
                employeeId: 'employmentDetail.employeeId',
                name: 'personalDetail.firstName',
                designation: 'employmentDetail.designation',
                employmentType: 'employmentDetail.employmentType',
                status: 'employmentDetail.status',
                createdAt: 'createdAt',
            };
            const mongoSortField = sortFieldMap[sortField] || 'createdAt';

            const pipeline: any[] = [
                { $match: baseFilter },
                {
                    $lookup: {
                        from: this.facultyEmploymentDetailModel.collection.name,
                        localField: 'employmentDetailId',
                        foreignField: '_id',
                        as: 'employmentDetail',
                    },
                },
                { $unwind: '$employmentDetail' },
                {
                    $lookup: {
                        from: this.facultyPersonalDetailModel.collection.name,
                        localField: 'personalDetailId',
                        foreignField: '_id',
                        as: 'personalDetail',
                    },
                },
                { $unwind: '$personalDetail' },
            ];

            if (Object.keys(employmentFilter).length > 0) {
                pipeline.push({ $match: employmentFilter });
            }

            pipeline.push(
                { $sort: { [mongoSortField]: sortOrder === 'asc' ? 1 : -1 } },
                { $skip: skip },
                { $limit: limit },
                { $project: { _id: 1 } },
            );

            const results = await this.facultyModel.aggregate(pipeline).exec();
            return results.map((r) => r._id);
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find ids of all active faculty — used for round-robin invigilator assignment
    async findActiveFacultyIds(): Promise<Types.ObjectId[]> {
        try {
            const docs = await this.facultyModel.find({ isActive: true }).select('_id').exec();
            return docs.map((doc) => doc._id as Types.ObjectId);
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find faculty by id list, preserving the given order (Mongo's $in doesn't guarantee it)
    async findByIdsPreserveOrder(ids: Types.ObjectId[]): Promise<FacultyDocument[]> {
        try {
            const docs = await this.facultyModel.find({ _id: { $in: ids } }).exec();
            const docsById = new Map<string, FacultyDocument>(
                docs.map((doc) => [(doc._id as Types.ObjectId).toString(), doc])
            );
            return ids
                .map((id) => docsById.get(id.toString()))
                .filter(Boolean) as FacultyDocument[];
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}