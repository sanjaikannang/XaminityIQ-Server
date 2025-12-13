import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Department, DepartmentDocument } from 'src/schemas/department.schema';

@Injectable()
export class DepartmentRepositoryService {
    constructor(
        @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    ) { }


    // Find department by ID
    async findById(deptId: string): Promise<DepartmentDocument | null> {
        try {
            return this.departmentModel.findById(deptId).exec();
        } catch (error) {
            throw new InternalServerErrorException(`Database error: ${error.message}`);
        }
    }


}