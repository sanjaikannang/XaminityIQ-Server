import { IsString, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateBatchRequest {

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{4}$/, { message: 'Batch name must be in format - 2020-2024' })
    batchName: string; // e.g., "2020-2024"

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{4}$/, { message: 'Start year must be 4 digits' })
    startYear: string; // e.g., "2020"

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{4}$/, { message: 'End year must be 4 digits' })
    endYear: string; // e.g., "2024"

}