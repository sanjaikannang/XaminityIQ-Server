import { IsEnum } from 'class-validator';
import { RecordingMediaType } from 'src/utils/enum';

export class FinalizeRecordingRequest {

    @IsEnum(RecordingMediaType)
    mediaType: RecordingMediaType;

}
