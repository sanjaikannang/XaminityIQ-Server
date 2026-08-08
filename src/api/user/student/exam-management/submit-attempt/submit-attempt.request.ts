import { IsEnum } from 'class-validator';
import { SubmissionTrigger } from 'src/utils/enum';

export class SubmitAttemptRequest {

    @IsEnum(SubmissionTrigger)
    trigger: SubmissionTrigger;

}
