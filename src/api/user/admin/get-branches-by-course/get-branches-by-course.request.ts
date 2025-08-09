import { IsNotEmpty, IsString } from "class-validator";

export class GetBranchesByCourseRequest {

    @IsNotEmpty()
    @IsString()
    courseId: string;

}