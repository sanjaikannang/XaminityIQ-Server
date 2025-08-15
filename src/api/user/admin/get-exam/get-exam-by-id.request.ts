
import { IsNotEmpty, IsString } from "class-validator";

export class GetExamByIdRequest {

    @IsNotEmpty()
    @IsString()
    id: string;

}