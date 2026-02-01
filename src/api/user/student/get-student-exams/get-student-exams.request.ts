import { ExamStatus } from 'src/utils/enum';
import { IsEnum, IsOptional } from 'class-validator';

export class GetStudentExamsRequest {

    @IsEnum(ExamStatus)
    @IsOptional()
    status?: ExamStatus;

}