import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Batch, BatchDocument } from 'src/schemas/hierarchy/batch.schema';
import { Status } from 'src/utils/enum';


@Injectable()
export class BatchRepositoryService {
    constructor(
        @InjectModel(Batch.name) private batchModel: Model<BatchDocument>,
    ) { }

    // Find Batch by ID
    async findById(id: string): Promise<BatchDocument | null> {
        try {

            const batch = await this.batchModel.findById(id).exec();
            return batch;

        } catch (error) {
            console.error("Failed to find batch by ID", error);
            throw new Error('Could not find batch by ID');
        }
    }

    // Find Batch by name
    async findByName(name: string): Promise<BatchDocument | null> {
        try {

            const batch = await this.batchModel.findOne({
                name: { $regex: `^${name.trim()}$`, $options: 'i' },
            }).exec();

            return batch;

        } catch (error) {
            console.error("Failed to find batch name", error);
            throw new Error('Could not batch name by name');
        }
    }


    // Create batch
    async create(batchData: {
        name: string;
        startYear: number;
        endYear: number;
        createdBy: Types.ObjectId;
    }): Promise<BatchDocument> {
        try {

            // Create new batch instance
            const newBatch = new this.batchModel({
                name: batchData.name.trim(),
                startYear: batchData.startYear,
                endYear: batchData.endYear,
                createdBy: batchData.createdBy,
                status: Status.ACTIVE
            });

            // Save batch to database
            const savedBatch = await newBatch.save();

            return savedBatch;

        } catch (error) {
            console.error("Failed to create batch", error);
            throw new Error('Could not create batch');
        }
    }


    // Get all active batches
    async findAllBatches(): Promise<BatchDocument[]> {
        try {
            const batch = await this.batchModel
                .find({ status: Status.ACTIVE })
                .select('_id name startYear endYear')
                .sort({ startYear: 1 })
                .exec();

            return batch;
        } catch (error) {
            console.error("Failed to get batchs", error);
            throw new Error('Could not get batch');
        }
    }

}