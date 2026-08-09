import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { RecordingMediaType } from 'src/utils/enum';

export class RecordChunkRequest {

    @IsEnum(RecordingMediaType)
    mediaType: RecordingMediaType;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    sequence: number;

    @IsString()
    @IsNotEmpty()
    cloudinaryAssetId: string;

    @IsString()
    @IsNotEmpty()
    cloudinaryUrl: string;

}
