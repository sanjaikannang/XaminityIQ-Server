import { IsNotEmpty, IsString } from "class-validator";

export class DeleteStudentRequest {

    @IsString()
    @IsNotEmpty()
    id: string;

}