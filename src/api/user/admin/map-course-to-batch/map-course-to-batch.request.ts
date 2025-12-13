import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MapCourseToBatchRequest {

    @IsMongoId()
    @IsNotEmpty()
    courseId: string;

}