import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Student, StudentDocument } from 'src/schemas/User/Student/student.schema';
import { StudentAcademicDetail, StudentAcademicDetailDocument } from 'src/schemas/User/Student/studentAcademicDetail.schema';
import { StudentPersonalDetail, StudentPersonalDetailDocument } from 'src/schemas/User/Student/studentPersonalDetails.schema';

@Injectable()
export class StudentRepositoryService {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
        @InjectModel(StudentAcademicDetail.name) private studentAcademicDetailModel: Model<StudentAcademicDetailDocument>,
        @InjectModel(StudentPersonalDetail.name) private studentPersonalDetailModel: Model<StudentPersonalDetailDocument>,
    ) { }


    // Create a new student document
    async create(
        data: Partial<Student>,
        session?: ClientSession
    ): Promise<StudentDocument> {
        try {
            const student = new this.studentModel(data);
            return await student.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find a student by MongoDB ObjectId
    async findById(id: Types.ObjectId): Promise<StudentDocument | null> {
        try {
            return await this.studentModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find a student using the related userId
    async findByUserId(userId: Types.ObjectId): Promise<StudentDocument | null> {
        try {
            return await this.studentModel.findOne({ userId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Find a student by custom studentId
    async findByStudentId(studentId: string): Promise<StudentDocument | null> {
        try {
            return await this.studentModel.findOne({ studentId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Update student data by MongoDB ObjectId
    async updateById(
        id: Types.ObjectId,
        data: Partial<Student>,
        session?: ClientSession
    ): Promise<StudentDocument | null> {
        try {
            return await this.studentModel
                .findByIdAndUpdate(id, data, { new: true, session })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(
                `Database error: ${error.message}`
            );
        }
    }


    // Count Students
    async countStudents(filter: any = {}): Promise<number> {
        try {
            return await this.studentModel.countDocuments(filter).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find All Students with all Details
    async findAllWithDetails(filter: any = {}, skip: number = 0, limit: number = 10): Promise<StudentDocument[]> {
        try {
            return await this.studentModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Count students matching a base filter (on Student) plus an academic-detail filter (batch/course/department/section/status)
    async countWithAcademicFilter(baseFilter: any, academicFilter: any): Promise<number> {
        try {
            const pipeline: any[] = [
                { $match: baseFilter },
                {
                    $lookup: {
                        from: this.studentAcademicDetailModel.collection.name,
                        localField: 'academicDetailId',
                        foreignField: '_id',
                        as: 'academicDetail',
                    },
                },
                { $unwind: '$academicDetail' },
            ];

            if (Object.keys(academicFilter).length > 0) {
                pipeline.push({ $match: academicFilter });
            }

            pipeline.push({ $count: 'total' });

            const result = await this.studentModel.aggregate(pipeline).exec();
            return result[0]?.total || 0;
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find student ids matching filter + academic filter, sorted, for a page (order-preserving)
    async findIdsWithAcademicFilterSorted(
        baseFilter: any,
        academicFilter: any,
        sortField: string,
        sortOrder: 'asc' | 'desc',
        skip: number,
        limit: number
    ): Promise<Types.ObjectId[]> {
        try {
            const sortFieldMap: Record<string, string> = {
                rollNumber: 'academicDetail.rollNumber',
                name: 'personalDetail.firstName',
                semester: 'academicDetail.currentSemester',
                status: 'academicDetail.status',
                createdAt: 'createdAt',
            };
            const mongoSortField = sortFieldMap[sortField] || 'createdAt';

            const pipeline: any[] = [
                { $match: baseFilter },
                {
                    $lookup: {
                        from: this.studentAcademicDetailModel.collection.name,
                        localField: 'academicDetailId',
                        foreignField: '_id',
                        as: 'academicDetail',
                    },
                },
                { $unwind: '$academicDetail' },
                {
                    $lookup: {
                        from: this.studentPersonalDetailModel.collection.name,
                        localField: 'personalDetailId',
                        foreignField: '_id',
                        as: 'personalDetail',
                    },
                },
                { $unwind: '$personalDetail' },
            ];

            if (Object.keys(academicFilter).length > 0) {
                pipeline.push({ $match: academicFilter });
            }

            pipeline.push(
                { $sort: { [mongoSortField]: sortOrder === 'asc' ? 1 : -1 } },
                { $skip: skip },
                { $limit: limit },
                { $project: { _id: 1 } },
            );

            const results = await this.studentModel.aggregate(pipeline).exec();
            return results.map((r) => r._id);
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find ALL student ids matching filter + academic filter (no pagination) — used for room formation
    async findAllIdsWithAcademicFilter(baseFilter: any, academicFilter: any): Promise<Types.ObjectId[]> {
        try {
            const pipeline: any[] = [
                { $match: baseFilter },
                {
                    $lookup: {
                        from: this.studentAcademicDetailModel.collection.name,
                        localField: 'academicDetailId',
                        foreignField: '_id',
                        as: 'academicDetail',
                    },
                },
                { $unwind: '$academicDetail' },
            ];

            if (Object.keys(academicFilter).length > 0) {
                pipeline.push({ $match: academicFilter });
            }

            pipeline.push({ $project: { _id: 1 } });

            const results = await this.studentModel.aggregate(pipeline).exec();
            return results.map((r) => r._id);
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find students by id list, preserving the given order (Mongo's $in doesn't guarantee it)
    async findByIdsPreserveOrder(ids: Types.ObjectId[]): Promise<StudentDocument[]> {
        try {
            const docs = await this.studentModel.find({ _id: { $in: ids } }).exec();
            const docsById = new Map<string, StudentDocument>(
                docs.map((doc) => [(doc._id as Types.ObjectId).toString(), doc])
            );
            return ids
                .map((id) => docsById.get(id.toString()))
                .filter(Boolean) as StudentDocument[];
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }
}