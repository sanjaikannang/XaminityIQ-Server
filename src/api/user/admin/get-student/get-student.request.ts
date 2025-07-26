
import { IsNotEmpty, IsString } from "class-validator";

export class GetStudentRequest {

    @IsNotEmpty()
    @IsString()
    id: string;
    
}