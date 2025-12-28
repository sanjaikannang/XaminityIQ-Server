import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetFacultyRequest {

    @IsNotEmpty()
    @IsMongoId()
    id: string;

}