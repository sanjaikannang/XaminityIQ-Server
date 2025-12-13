import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MapCourseToBatchRequest {

    @IsMongoId()
    @IsNotEmpty()
    batchId: string;

    @IsMongoId()
    @IsNotEmpty()
    courseId: string;

}