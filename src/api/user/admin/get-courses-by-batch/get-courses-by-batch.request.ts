import { IsNotEmpty, IsString } from "class-validator";

export class GetCoursesByBatchRequest {

    @IsNotEmpty()
    @IsString()
    batchId: string;

}