import { Type } from 'class-transformer';
import { Gender, RelationType, AdmissionType, EducationLevel, Qualification, BoardType, Country } from 'src/utils/enum';
import { IsString, IsEmail, IsEnum, IsDateString, IsBoolean, IsOptional, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';

class EmergencyContactDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(RelationType)
    relation: string;

    @IsString()
    @IsNotEmpty()
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
    pincode: string;

    @IsEnum(Country)
    country: string;
}

class ParentInfoDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    phoneNumber: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    occupation: string;
}

class GuardianInfoDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    relation: string;

    @IsString()
    @IsOptional()
    phoneNumber: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    occupation: string;
}

class EducationHistoryDto {
    @IsEnum(EducationLevel)
    level: string;

    @IsEnum(Qualification)
    qualification: string;

    @IsEnum(BoardType)
    boardOrUniversity: string;

    @IsString()
    @IsNotEmpty()
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
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsDateString()
    dateOfBirth: Date;

    @IsString()
    @IsNotEmpty()
    profilePhotoUrl: string;

    @IsString()
    @IsOptional()
    religion: string;

    // Contact Information
    @IsEmail()
    personalEmail: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsOptional()
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
    educationHistory: EducationHistoryDto[];
}