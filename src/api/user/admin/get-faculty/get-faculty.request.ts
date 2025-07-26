import { IsNotEmpty, IsString } from "class-validator";

export class GetFacultyRequest {

    @IsString()
    @IsNotEmpty()
    id: string;

}