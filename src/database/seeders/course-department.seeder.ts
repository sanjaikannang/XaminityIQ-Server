import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import data from "../data/course-department.json";
import { Course, CourseDocument } from '../../schemas/course.schema';
import { Department, DepartmentDocument } from '../../schemas/department.schema';

@Injectable()
export class CourseDepartmentSeeder {

    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    ) { }

    async seed(): Promise<void> {
        try {
            const jsonData = data;

            for (const stream of jsonData.streams) {
                for (const course of stream.courses) {
                    // Check if course already exists
                    const existingCourse = await this.courseModel.findOne({
                        courseCode: course.courseCode
                    }).exec();

                    if (existingCourse) {
                        console.log(`Course ${course.courseCode} already exists. Skipping.`);
                        continue;
                    }

                    // Create course
                    const newCourse = new this.courseModel({
                        streamCode: stream.streamCode,
                        streamName: stream.streamName,
                        courseCode: course.courseCode,
                        courseName: course.courseName,
                        level: course.level,
                        duration: course.duration,
                        semesters: course.semesters,
                    });

                    const savedCourse = await newCourse.save();
                    console.log(`Course ${course.courseCode} created successfully!`);

                    // Create departments for this course
                    for (const dept of course.departments) {
                        const newDepartment = new this.departmentModel({
                            courseId: savedCourse._id,
                            deptCode: dept.deptCode,
                            deptName: dept.deptName,
                        });

                        await newDepartment.save();
                    }

                    console.log(`Departments for ${course.courseCode} created successfully!`);
                }
            }

            console.log('All courses and departments seeded successfully!');
        } catch (error) {
            console.error('Error seeding courses and departments:', error.message);
            throw error;
        }
    }

    async drop(): Promise<void> {
        try {
            await this.departmentModel.deleteMany({}).exec();
            await this.courseModel.deleteMany({}).exec();
            console.log('All courses and departments removed successfully!');
        } catch (error) {
            console.error('Error removing courses and departments:', error.message);
            throw error;
        }
    }
}