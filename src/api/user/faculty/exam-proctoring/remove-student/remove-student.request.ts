import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RemoveStudentRequest {

    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;

}
