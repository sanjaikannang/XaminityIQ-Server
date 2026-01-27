import { IsString, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DeviceStatus {
    camera: boolean;
    microphone: boolean;
    screenShare: boolean;
    fullscreen: boolean;
}

export class StudentJoinRequestRequest {
    @IsString()
    @IsNotEmpty()
    studentId: string;

    // @IsObject()
    // @ValidateNested()
    // @Type(() => DeviceStatus)
    // deviceStatus: DeviceStatus;
}