import { IsBoolean } from 'class-validator';

export class SetStudentMicRequest {

    @IsBoolean()
    muted: boolean;

}
