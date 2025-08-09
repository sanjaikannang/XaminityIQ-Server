import { FilterQuery, Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from 'src/schemas/hierarchy/course.schema';
import { Status } from 'src/utils/enum';


@Injectable()
export class CourseRepositoryService {
    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    ) { }


    // Find Course by ID
    async findById(id: string): Promise<CourseDocument | null> {
        try {
            const course = await this.courseModel.findById(id).exec();
            return course;
        } catch (error) {
            console.error("Failed to find course by ID", error);
            throw new Error('Could not find course');
        }
    }


    // Find Course
    async findOne(filter: FilterQuery<CourseDocument>): Promise<CourseDocument | null> {
        try {

            const course = await this.courseModel.findOne(filter).exec();
            return course;

        } catch (error) {
            console.error("Failed to find course", error);
            throw new Error('Could not find course');
        }
    }


    // Create Course
    async create(courseData: Partial<Course>): Promise<CourseDocument> {
        try {

            const createdCourse = new this.courseModel(courseData);
            return createdCourse.save();

        } catch (error) {
            console.error("Failed to create course", error);
            throw new Error('Could not create course');
        }
    }


    // Find all courses with optional filters
    async find(filter: FilterQuery<CourseDocument> = {}): Promise<CourseDocument[]> {
        try {
            // Convert string ObjectIds to actual ObjectIds if needed
            const processedFilter = { ...filter };

            if (processedFilter.batchId && typeof processedFilter.batchId === 'string') {
                processedFilter.batchId = new Types.ObjectId(processedFilter.batchId);
            }

            return await this.courseModel.find(processedFilter).exec();
        } catch (error) {
            console.error("Failed to find courses", error);
            throw new Error('Could not find courses');
        }
    }


    //
    async findByBatchId(batchId: string): Promise<CourseDocument[]> {
        try {
            const courses = await this.courseModel
                .find({
                    batchId: new Types.ObjectId(batchId),
                    status: Status.ACTIVE
                })
                .select('_id name fullName batchId totalSemesters durationYears courseType status')
                .lean()
                .exec();

            return courses;

        } catch (error) {
            console.error("Failed to get courses by batch id", error);
            throw new Error('Could not get courses by batch id');
        }
    }


}