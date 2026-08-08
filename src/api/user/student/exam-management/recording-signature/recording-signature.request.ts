import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { RecordingMediaType } from 'src/utils/enum';

export class RecordingSignatureRequest {

    @IsEnum(RecordingMediaType)
    mediaType: RecordingMediaType;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    sequence: number;

}
