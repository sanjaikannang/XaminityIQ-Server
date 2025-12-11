import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Batch, BatchDocument } from 'src/schemas/batch.schema';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class BatchRepositoryService {
    constructor(
        @InjectModel(Batch.name) private batchModel: Model<BatchDocument>,
    ) { }


    // Find batch by batch name
    async findByBatchName(batchName: string): Promise<BatchDocument | null> {
        return this.batchModel.findOne({ batchName }).exec();
    }


    // Create new batch
    async create(batchData: {
        batchName: string;
        startYear: number;
        endYear: number;
    }): Promise<BatchDocument> {
        try {
            const batch = new this.batchModel(batchData);
            return batch.save();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }

}