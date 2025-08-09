import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from 'src/schemas/hierarchy/course.schema';


@Injectable()
export class CourseRepositoryService {
    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    ) { }


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



}