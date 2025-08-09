import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateSectionRequest {

    @IsString()
    @IsNotEmpty()
    name: string; // e.g., "A", "B", "C"

    @IsMongoId()
    @IsNotEmpty()
    branchId: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    capacity?: number;

}