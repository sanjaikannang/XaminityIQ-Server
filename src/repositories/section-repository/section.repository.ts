import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Section, SectionDocument } from 'src/schemas/Academic/section.schema';

@Injectable()
export class SectionRepositoryService {
    constructor(
        @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    ) { }


    // Find sections by batch, course and department
    async findByBatchCourseDept(batchId: string, courseId: string, departmentId: string): Promise<SectionDocument[]> {
        try {
            return this.sectionModel.find({ batchId, courseId, departmentId }).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Create multiple sections in bulk
    async createMany(sections: Array<{
        batchId: Types.ObjectId;
        courseId: Types.ObjectId;
        departmentId: Types.ObjectId;
        sectionName: string;
        capacity: number;
        currentStrength: number;
    }>): Promise<SectionDocument[]> {
        try {
            return await this.sectionModel.insertMany(sections);
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


    // Find sections by batch, course and department
    async findByBatchCourseAndDepartment(batchId: string, courseId: string, departmentId: string) {
        return this.sectionModel
            .find({
                batchId: new Types.ObjectId(batchId),
                courseId: new Types.ObjectId(courseId),
                departmentId: new Types.ObjectId(departmentId)
            })
            .sort({ sectionName: 1 })
            .exec();
    }


    // Find Section
    async findById(id: string): Promise<SectionDocument | null> {
        try {
            return await this.sectionModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}