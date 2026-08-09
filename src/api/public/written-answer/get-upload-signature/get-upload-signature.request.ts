import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class GetUploadSignatureRequest {

    @IsString()
    @IsNotEmpty()
    token: string;

    @IsInt()
    @Min(1)
    @Max(50)
    pageNumber: number;

}
