import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from 'src/schemas/course.schema';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CourseRepositoryService {
    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    ) { }


    // Find course by ID
    async findById(courseId: string): Promise<CourseDocument | null> {
        try {
            return this.courseModel.findById(courseId).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Get all courses
    async findAll() {
        return this.courseModel
            .find()
            .sort({ courseName: 1 })
            .exec();
    }


}