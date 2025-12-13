import { CreateBatchRequest } from "src/api/user/admin/create-batch/create-batch.request";
import { BatchRepositoryService } from "src/repositories/batch-repository/batch-repository";
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { MapCourseToBatchRequest } from "src/api/user/admin/map-course-to-batch/map-course-to-batch.request";

@Injectable()
export class AdminService {
    constructor(
        private readonly batchRepositoryService: BatchRepositoryService,
    ) { }


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


    async mapCourseToBatchAPI(batchId: MapCourseToBatchRequest) {
        try {

            
        } catch (error) {

        }
    }

}