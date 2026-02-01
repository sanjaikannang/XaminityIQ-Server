import { ExamStatus } from 'src/utils/enum';
import { IsEnum, IsOptional } from 'class-validator';

export class GetFacultyExamsRequest {

    @IsEnum(ExamStatus)
    @IsOptional()
    status?: ExamStatus;

}