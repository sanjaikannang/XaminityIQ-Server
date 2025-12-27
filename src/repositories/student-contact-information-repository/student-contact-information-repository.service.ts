import { ClientSession, Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StudentContactInformation, StudentContactInformationDocument } from 'src/schemas/User/Student/studentContactInformation.schema';

@Injectable()
export class StudentContactInformationRepositoryService {
    constructor(
        @InjectModel(StudentContactInformation.name) private studentContactInformationModel: Model<StudentContactInformationDocument>
    ) { }


    async create(data: Partial<StudentContactInformation>, session?: ClientSession): Promise<StudentContactInformationDocument> {
        const contact = new this.studentContactInformationModel(data);
        return await contact.save({ session });
    }

    async findById(id: Types.ObjectId): Promise<StudentContactInformationDocument | null> {
        return await this.studentContactInformationModel.findById(id).exec();
    }

    async findByPersonalEmail(email: string): Promise<StudentContactInformationDocument | null> {
        return await this.studentContactInformationModel.findOne({ personalEmail: email }).exec();
    }

    async findByStudentEmail(email: string): Promise<StudentContactInformationDocument | null> {
        return await this.studentContactInformationModel.findOne({ studentEmail: email }).exec();
    }


}