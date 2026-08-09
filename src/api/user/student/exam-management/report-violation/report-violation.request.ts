import { IsEnum } from 'class-validator';
import { ViolationType } from 'src/utils/enum';

export class ReportViolationRequest {

    @IsEnum(ViolationType)
    type: ViolationType;

}
