import { Type } from 'class-transformer';
import {
    Gender, RelationType, AdmissionType, EducationLevel, Qualification, BoardType, Country
} from 'src/utils/enum';
import {
    IsString, IsEmail, IsEnum, IsDateString, IsBoolean, IsOptional, IsNumber, ValidateNested,
    IsNotEmpty, Matches, MinLength, MaxLength, ArrayMinSize
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

export class CreateStudentRequest {
    // Personal Details
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    lastName: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsDateString()
    dateOfBirth: string;

    @IsString()
    @IsNotEmpty()
    profilePhotoUrl: string;

    @IsString()
    @IsOptional()
    @MaxLength(30)
    religion: string;

    // Contact Information
    @IsEmail()
    personalEmail: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\+91\d{10}$/, { message: 'Phone number must start with +91 and contain 10 digits' })
    phoneNumber: string;

    @IsString()
    @IsOptional()
    @Matches(/^\+91\d{10}$/, { message: 'Phone number must start with +91 and contain 10 digits' })
    alternatePhoneNumber: string;

    @ValidateNested()
    @Type(() => EmergencyContactDto)
    emergencyContact: EmergencyContactDto;

    // Address Details
    @ValidateNested()
    @Type(() => AddressDto)
    currentAddress: AddressDto;

    @IsBoolean()
    sameAsCurrent: boolean;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsOptional()
    permanentAddress: AddressDto;

    // Academic Details
    @IsString()
    @IsNotEmpty()
    batchId: string;

    @IsString()
    @IsNotEmpty()
    courseId: string;

    @IsString()
    @IsNotEmpty()
    departmentId: string;

    @IsString()
    @IsNotEmpty()
    sectionId: string;

    @IsNumber()
    currentSemester: number;

    @IsEnum(AdmissionType)
    admissionType: AdmissionType;

    // Parent Details
    @ValidateNested()
    @Type(() => ParentInfoDto)
    @IsOptional()
    father: ParentInfoDto;

    @ValidateNested()
    @Type(() => ParentInfoDto)
    @IsOptional()
    mother: ParentInfoDto;

    @ValidateNested()
    @Type(() => GuardianInfoDto)
    @IsOptional()
    guardian: GuardianInfoDto;

    // Education History
    @ValidateNested({ each: true })
    @Type(() => EducationHistoryDto)
    @ArrayMinSize(1, { message: 'At least one education record is required' })
    educationHistory: EducationHistoryDto[];
}
