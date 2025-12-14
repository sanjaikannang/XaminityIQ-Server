import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { Types } from "mongoose";
import { generateSectionName } from "src/utils/utils";

// Requests
import { CreateBatchRequest } from "src/api/user/admin/create-batch/create-batch.request";
import { MapCourseToBatchRequest } from "src/api/user/admin/map-course-to-batch/map-course-to-batch.request";
import { AddDepartmentToBatchCourseRequest } from "src/api/user/admin/add-department-to-batch-course/add-department-to-batch-course.request";

// Repositories
import { BatchRepositoryService } from "src/repositories/batch-repository/batch-repository";
import { CourseRepositoryService } from "src/repositories/course-repository/course-repository";
import { BatchCourseRepositoryService } from "src/repositories/batch-course-repository/batch-course-repository";
import { DepartmentRepositoryService } from "src/repositories/department-repository/department-repository";
import { BatchDepartmentRepositoryService } from "src/repositories/batch-department-repository/batch-department-repository";
import { SectionRepositoryService } from "src/repositories/section-repository/section-repository";


@Injectable()
export class AdminService {
    constructor(
        private readonly batchRepositoryService: BatchRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly batchCourseRepositoryService: BatchCourseRepositoryService,
        private readonly departmentRepositoryService: DepartmentRepositoryService,
        private readonly batchDepartmentRepositoryService: BatchDepartmentRepositoryService,
        private readonly sectionRepositoryService: SectionRepositoryService
    ) { }


    // Create Batch API Endpoint
    async createBatchAPI(createBatchData: CreateBatchRequest) {
        try {
            const { batchName, startYear, endYear } = createBatchData;

            // Check if batch already exists
            const existingBatch = await this.batchRepositoryService.findByBatchName(batchName);
            if (existingBatch) {
                throw new ConflictException('Batch already exists');
            }

            // Validate batch name matches start and end year
            const expectedBatchName = `${startYear}-${endYear}`;
            if (batchName !== expectedBatchName) {
                throw new BadRequestException(`Batch name must be based on start and end year`);
            }

            // Convert to numbers
            const startYearNum = parseInt(startYear);
            const endYearNum = parseInt(endYear);

            await this.batchRepositoryService.create({
                batchName,
                startYear: startYearNum,
                endYear: endYearNum
            });

        } catch (error) {
            if (error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create batch');
        }
    }


    // Map Course to Batch API Endpoint
    async mapCourseToBatchAPI(batchId: string, mapCourseData: MapCourseToBatchRequest) {
        try {
            const { courseId } = mapCourseData;

            // Verify batch exists
            const batch = await this.batchRepositoryService.findById(batchId);
            if (!batch) {
                throw new NotFoundException('Batch not found');
            }

            // Verify course exists
            const course = await this.courseRepositoryService.findById(courseId);
            if (!course) {
                throw new NotFoundException('Course not found');
            }

            // Calculate batch duration (in years)
            const batchDuration = batch.endYear - batch.startYear;

            // Extract course duration (format - "4 Years", "3 Years", etc.)
            const courseDurationMatch = course.duration.match(/^(\d+)\s*[Yy]ear/);
            if (!courseDurationMatch) {
                throw new BadRequestException('Invalid course duration format');
            }
            const courseDuration = parseInt(courseDurationMatch[1]);

            // Validate course duration matches batch duration
            if (courseDuration !== batchDuration) {
                throw new BadRequestException(
                    `Course duration (${courseDuration} years) does not match batch duration (${batchDuration} years)`
                );
            }

            // Check if mapping already exists
            const existingMapping = await this.batchCourseRepositoryService.findByBatchAndCourse(batchId, courseId);
            if (existingMapping) {
                throw new ConflictException('Course already mapped to this batch');
            }

            // Create batch-course mapping
            const batchCourse = await this.batchCourseRepositoryService.create({
                batchId,
                courseId
            });

            return (batchCourse._id as any).toString();

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to map course to batch');
        }

    }


    // Add Department to Batch-Course API Endpoint
    async addDepartmentToBatchCourseAPI(batchCourseId: string, addDeptData: AddDepartmentToBatchCourseRequest) {
        try {
            const { deptId, totalSeats, sectionCapacity } = addDeptData;

            // Verify batch-course mapping exists
            const batchCourse = await this.batchCourseRepositoryService.findById(batchCourseId);
            if (!batchCourse) {
                throw new NotFoundException('Batch-Course mapping not found');
            }

            // Verify department exists
            const department = await this.departmentRepositoryService.findById(deptId);
            if (!department) {
                throw new NotFoundException('Department not found');
            }

            // Verify department belongs to the course
            if (department.courseId.toString() !== batchCourse.courseId.toString()) {
                throw new BadRequestException('Department does not belong to the mapped course');
            }

            // Check if department already added to this batch-course
            const existingBatchDept = await this.batchDepartmentRepositoryService.findByBatchCourseAndDept(
                batchCourseId,
                deptId
            );
            if (existingBatchDept) {
                throw new ConflictException('Department already added to this batch-course');
            }

            const finalSectionCapacity = sectionCapacity || 50;

            // Validate totalSeats
            if (totalSeats <= 0) {
                throw new BadRequestException('Total seats must be greater than 0');
            }

            if (finalSectionCapacity <= 0) {
                throw new BadRequestException('Section capacity must be greater than 0');
            }

            if (totalSeats < finalSectionCapacity) {
                throw new BadRequestException('Total seats cannot be less than section capacity');
            }

            // Create batch-department mapping
            const batchDepartment = await this.batchDepartmentRepositoryService.create({
                batchCourseId,
                courseId: batchCourse.courseId.toString(),
                deptId,
                totalSeats,
                sectionCapacity: sectionCapacity || 50
            });

            // Calculate number of sections needed
            const numberOfSections = Math.ceil(totalSeats / finalSectionCapacity);

            // Generate sections with batchId, courseId, and departmentId
            const sections: Array<{
                batchId: Types.ObjectId;
                courseId: Types.ObjectId;
                departmentId: Types.ObjectId;
                sectionName: string;
                capacity: number;
                currentStrength: number;
            }> = [];

            for (let i = 0; i < numberOfSections; i++) {
                const sectionName = generateSectionName(i);

                // Calculate capacity for this section
                // Last section might have fewer seats
                const isLastSection = i === numberOfSections - 1;
                const capacity = isLastSection
                    ? totalSeats - (i * finalSectionCapacity)
                    : finalSectionCapacity;

                sections.push({
                    batchId: new Types.ObjectId(batchCourse.batchId.toString()),
                    courseId: new Types.ObjectId(batchCourse.courseId.toString()),
                    departmentId: new Types.ObjectId(deptId),
                    sectionName,
                    capacity,
                    currentStrength: 0
                });
            }

            // Create all sections in bulk
            await this.sectionRepositoryService.createMany(sections);

            return (batchDepartment._id as any).toString();

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to add department to batch-course');
        }
    }


    // Get All Batches API Endpoint
    async getAllBatchesAPI(queryParams: { page?: number; limit?: number; search?: string }) {
        try {
            const page = queryParams.page || 1;
            const limit = queryParams.limit || 10;
            const search = queryParams.search || '';

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Build search filter
            let searchFilter = {};
            if (search && search.trim() !== '') {
                searchFilter = {
                    batchName: { $regex: search, $options: 'i' }
                };
            }

            // Get total count for pagination
            const totalItems = await this.batchRepositoryService.countDocuments(searchFilter);

            // Get batches with pagination
            const batches = await this.batchRepositoryService.findWithPagination(
                searchFilter,
                skip,
                limit
            );

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalItems / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                batches: batches.map(batch => ({
                    _id: (batch._id as any).toString(),
                    batchName: batch.batchName,
                    startYear: batch.startYear,
                    endYear: batch.endYear,
                    createdAt: (batch as any).createdAt,
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage
                }
            };

        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch batches');
        }
    }


    // Get All Courses for Batch API Endpoint
    async getAllCoursesForBatchAPI(batchId: string, queryParams: { page?: number; limit?: number; search?: string }) {
        try {
            const page = queryParams.page || 1;
            const limit = queryParams.limit || 10;
            const search = queryParams.search || '';

            // Verify batch exists
            const batch = await this.batchRepositoryService.findById(batchId);
            if (!batch) {
                throw new NotFoundException('Batch not found');
            }

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Build search filter for courses
            let courseSearchFilter = {};
            if (search && search.trim() !== '') {
                courseSearchFilter = {
                    $or: [
                        { courseName: { $regex: search, $options: 'i' } },
                        { courseCode: { $regex: search, $options: 'i' } },
                        { streamName: { $regex: search, $options: 'i' } },
                        { streamCode: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            // Get total count for pagination
            const totalItems = await this.batchCourseRepositoryService.countCoursesForBatch(
                batchId,
                courseSearchFilter
            );

            // Get courses with pagination
            const coursesData = await this.batchCourseRepositoryService.findCoursesForBatchWithPagination(
                batchId,
                courseSearchFilter,
                skip,
                limit
            );

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalItems / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                courses: coursesData.map(item => {
                    const course = item.courseId as any;
                    return {
                        _id: course._id.toString(),
                        batchCourseId: (item._id as any).toString(),
                        streamCode: course.streamCode,
                        streamName: course.streamName,
                        courseCode: course.courseCode,
                        courseName: course.courseName,
                        level: course.level,
                        duration: course.duration,
                        semesters: course.semesters,
                        createdAt: course.createdAt,
                    };
                }),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage
                }
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch courses for batch');
        }
    }


    // Get All Departments for Batch-Course API Endpoint
    async getAllDepartmentsForBatchCourseAPI(
        batchCourseId: string,
        queryParams: { page?: number; limit?: number; search?: string }
    ) {
        try {
            const page = queryParams.page || 1;
            const limit = queryParams.limit || 10;
            const search = queryParams.search || '';

            // Verify batch-course mapping exists
            const batchCourse = await this.batchCourseRepositoryService.findById(batchCourseId);
            if (!batchCourse) {
                throw new NotFoundException('Batch-Course mapping not found');
            }

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Build search filter for departments
            let departmentSearchFilter = {};
            if (search && search.trim() !== '') {
                departmentSearchFilter = {
                    $or: [
                        { deptName: { $regex: search, $options: 'i' } },
                        { deptCode: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            // Get total count for pagination
            const totalItems = await this.batchDepartmentRepositoryService.countDepartmentsForBatchCourse(
                batchCourseId,
                departmentSearchFilter
            );

            // Get departments with pagination
            const departmentsData = await this.batchDepartmentRepositoryService.findDepartmentsForBatchCourseWithPagination(
                batchCourseId,
                departmentSearchFilter,
                skip,
                limit
            );

            // For each department, get its sections
            const departmentsWithSections = await Promise.all(
                departmentsData.map(async (batchDept) => {
                    const department = batchDept.deptId as any;

                    // Get sections for this department in this batch-course
                    const sections = await this.sectionRepositoryService.findByBatchCourseAndDepartment(
                        batchCourse.batchId.toString(),
                        batchCourse.courseId.toString(),
                        department._id.toString()
                    );

                    return {
                        _id: department._id.toString(),
                        batchDepartmentId: (batchDept._id as any).toString(),
                        deptCode: department.deptCode,
                        deptName: department.deptName,
                        totalSeats: batchDept.totalSeats,
                        sectionCapacity: batchDept.sectionCapacity,
                        sections: sections.map(section => ({
                            _id: (section._id as any).toString(),
                            sectionName: section.sectionName,
                            capacity: section.capacity,
                            currentStrength: section.currentStrength,
                            createdAt: (section as any).createdAt,
                        })),
                        createdAt: department.createdAt,
                    };
                })
            );

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalItems / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                departments: departmentsWithSections,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage
                }
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch departments for batch-course');
        }
    }

}