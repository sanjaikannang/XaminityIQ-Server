import { IsNotEmpty, IsString } from "class-validator";

export class DeleteFacultyRequest {

    @IsString()
    @IsNotEmpty()
    id: string;

}