import { IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class AddDepartmentToBatchCourseRequest {

    @IsMongoId()
    @IsNotEmpty()
    deptId: string;

    @IsNumber()
    @IsPositive()
    totalSeats: number;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    sectionCapacity?: number;

}