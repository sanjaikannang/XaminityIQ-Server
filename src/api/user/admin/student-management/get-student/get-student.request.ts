import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetStudentRequest {

    @IsNotEmpty()
    @IsMongoId()
    id: string;

}