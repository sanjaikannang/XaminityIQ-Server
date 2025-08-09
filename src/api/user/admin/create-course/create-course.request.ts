import { IsString, IsNotEmpty, IsMongoId, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { CourseType } from 'src/utils/enum';

export class CreateCourseRequest {

    @IsString()
    @IsNotEmpty()
    name: string; // e.g., "B.Sc", "B.Com", "MCA", "BCA"

    @IsString()
    @IsNotEmpty()
    fullName: string; // e.g., "Bachelor of Science", "Bachelor of Commerce"

    @IsMongoId()
    @IsNotEmpty()
    batchId: string; // Will be converted to Types.ObjectId

    @IsNumber()
    @Min(1)
    totalSemesters: number; // e.g., 6 for BSC, 4 for MCA

    @IsNumber()
    @Min(1)
    durationYears: number; // e.g., 3 for BSC, 2 for MCA

    @IsEnum(CourseType)
    courseType: string;

}