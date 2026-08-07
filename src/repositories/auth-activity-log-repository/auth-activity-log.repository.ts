import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthActivityLog, AuthActivityLogDocument } from 'src/schemas/AuthActivityLog/auth-activity-log.schema';

@Injectable()
export class AuthActivityLogRepositoryService {
    constructor(
        @InjectModel(AuthActivityLog.name) private authActivityLogModel: Model<AuthActivityLogDocument>,
    ) { }


    // Create Auth Activity Log
    async create(data: Partial<AuthActivityLog>): Promise<AuthActivityLogDocument> {
        try {
            const log = new this.authActivityLogModel(data);
            return await log.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to record auth activity log', error);
        }
    }

}
