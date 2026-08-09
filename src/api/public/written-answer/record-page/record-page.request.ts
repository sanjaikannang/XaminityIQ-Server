import { IsInt, IsNotEmpty, IsString, IsUrl, Max, Min } from 'class-validator';

export class RecordPageRequest {

    @IsString()
    @IsNotEmpty()
    token: string;

    @IsInt()
    @Min(1)
    @Max(50)
    pageNumber: number;

    @IsUrl()
    cloudinaryUrl: string;

    @IsString()
    @IsNotEmpty()
    cloudinaryAssetId: string;

}
