import { Type } from 'class-transformer';
import { RelationType, Country, EducationLevel, MaritalStatus, HighestQualification } from 'src/utils/enum';
import {
    IsString, IsEnum, IsBoolean, IsOptional, IsNumber, ValidateNested,
    IsNotEmpty, Matches, MaxLength, IsArray, IsDateString,
} from 'class-validator';

class FacultyEmergencyContactDto {
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

class FacultyAddressDto {
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

class FacultyEducationHistoryDto {
    @IsEnum(EducationLevel)
    level: EducationLevel;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    qualification: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    boardOrUniversity: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    institutionName: string;

    @IsNumber()
    yearOfPassing: number;

    @IsNumber()
    percentageOrCGPA: number;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    specialization: string;
}

class FacultyWorkExperienceDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    organization: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    role: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    department: string;

    @IsDateString()
    fromDate: string;

    @IsDateString()
    toDate: string;

    @IsNumber()
    experienceYears: number;

    @IsString()
    @IsOptional()
    jobDescription: string;

    @IsString()
    @IsOptional()
    reasonForLeaving: string;

    @IsBoolean()
    @IsOptional()
    isCurrent: boolean;
}

// Every field is optional — faculty fill in whatever they have; anything
// omitted is left as-is (see FacultyService.updateMyProfileAPI).
export class UpdateMyFacultyProfileRequest {

    @IsString()
    @IsOptional()
    profilePhotoUrl?: string;

    @IsEnum(MaritalStatus)
    @IsOptional()
    maritalStatus?: MaritalStatus;

    @IsString()
    @IsOptional()
    @Matches(/^\+91\d{10}$/, { message: 'Alternate phone number must start with +91 and contain 10 digits' })
    alternatePhoneNumber?: string;

    @ValidateNested()
    @Type(() => FacultyEmergencyContactDto)
    @IsOptional()
    emergencyContact?: FacultyEmergencyContactDto;

    @ValidateNested()
    @Type(() => FacultyAddressDto)
    @IsOptional()
    currentAddress?: FacultyAddressDto;

    @IsBoolean()
    @IsOptional()
    sameAsCurrent?: boolean;

    @ValidateNested()
    @Type(() => FacultyAddressDto)
    @IsOptional()
    permanentAddress?: FacultyAddressDto;

    @IsNumber()
    @IsOptional()
    totalExperienceYears?: number;

    @IsEnum(HighestQualification)
    @IsOptional()
    highestQualification?: string;

    @ValidateNested({ each: true })
    @Type(() => FacultyEducationHistoryDto)
    @IsArray()
    @IsOptional()
    educationHistory?: FacultyEducationHistoryDto[];

    @ValidateNested({ each: true })
    @Type(() => FacultyWorkExperienceDto)
    @IsArray()
    @IsOptional()
    workExperience?: FacultyWorkExperienceDto[];

}
