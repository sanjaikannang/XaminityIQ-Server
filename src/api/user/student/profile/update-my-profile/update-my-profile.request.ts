import { Type } from 'class-transformer';
import { RelationType, Country, EducationLevel, Qualification, BoardType } from 'src/utils/enum';
import {
    IsString, IsEmail, IsEnum, IsBoolean, IsOptional, IsNumber, ValidateNested,
    IsNotEmpty, Matches, MaxLength, IsArray,
} from 'class-validator';

class EmergencyContactDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @IsEnum(RelationType)
    relation: RelationType;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\+91\d{10}$/, { message: 'Phone number must start with +91 and contain 10 digits' })
    phoneNumber: string;
}

class AddressDto {
    @IsString()
    @IsNotEmpty()
    addressLine1: string;

    @IsString()
    @IsOptional()
    addressLine2: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{6}$/, { message: 'Pincode must be a 6-digit number' })
    pincode: string;

    @IsEnum(Country)
    country: Country;
}

class ParentInfoDto {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    name: string;

    @IsString()
    @IsOptional()
    @Matches(/^\+91\d{10}$/, { message: 'Phone number must start with +91 and contain 10 digits' })
    phoneNumber: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    occupation: string;
}

class GuardianInfoDto extends ParentInfoDto {
    @IsString()
    @IsOptional()
    relation: string;
}

class EducationHistoryDto {
    @IsEnum(EducationLevel)
    level: EducationLevel;

    @IsEnum(Qualification)
    qualification: Qualification;

    @IsEnum(BoardType)
    boardOrUniversity: BoardType;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    institutionName: string;

    @IsNumber()
    yearOfPassing: number;

    @IsNumber()
    percentageOrCGPA: number;
}

// Every field is optional — students fill in whatever they have; anything
// omitted is left as-is (see StudentService.updateMyProfileAPI).
export class UpdateMyStudentProfileRequest {

    @IsString()
    @IsOptional()
    profilePhotoUrl?: string;

    @IsString()
    @IsOptional()
    @Matches(/^\+91\d{10}$/, { message: 'Phone number must start with +91 and contain 10 digits' })
    alternatePhoneNumber?: string;

    @ValidateNested()
    @Type(() => EmergencyContactDto)
    @IsOptional()
    emergencyContact?: EmergencyContactDto;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsOptional()
    currentAddress?: AddressDto;

    @IsBoolean()
    @IsOptional()
    sameAsCurrent?: boolean;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsOptional()
    permanentAddress?: AddressDto;

    @ValidateNested()
    @Type(() => ParentInfoDto)
    @IsOptional()
    father?: ParentInfoDto;

    @ValidateNested()
    @Type(() => ParentInfoDto)
    @IsOptional()
    mother?: ParentInfoDto;

    @ValidateNested()
    @Type(() => GuardianInfoDto)
    @IsOptional()
    guardian?: GuardianInfoDto;

    @ValidateNested({ each: true })
    @Type(() => EducationHistoryDto)
    @IsArray()
    @IsOptional()
    educationHistory?: EducationHistoryDto[];

}
