import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";

// Requests
import { CreateBatchRequest } from "src/api/user/admin/create-batch/create-batch.request";
import { MapCourseToBatchRequest } from "src/api/user/admin/map-course-to-batch/map-course-to-batch.request";

// Repositories
import { BatchRepositoryService } from "src/repositories/batch-repository/batch-repository";
import { CourseRepositoryService } from "src/repositories/course-repository/course-repository";
import { BatchCourseRepositoryService } from "src/repositories/batch-course-repository/batch-course-repository";

@Injectable()
export class AdminService {
    constructor(
        private readonly batchRepositoryService: BatchRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly batchCourseRepositoryService: BatchCourseRepositoryService
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
}