import { Type } from 'class-transformer';
import {
    Gender, MaritalStatus, Nationality, RelationType, Country, EducationLevel,
    FacultyDesignation,
    EmploymentStatus,
    HighestQualification,
    EmploymentType
} from 'src/utils/enum';
import {
    IsString, IsEmail, IsEnum, IsDateString, IsBoolean, IsOptional, IsNumber, ValidateNested,
    IsNotEmpty, Matches, MaxLength, ArrayMinSize, IsArray
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

export class CreateFacultyRequest {
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

    @IsEnum(MaritalStatus)
    maritalStatus: MaritalStatus;

    @IsString()
    @IsNotEmpty()
    profilePhotoUrl: string;

    // @IsString()
    // @IsNotEmpty()
    // nationality: string;

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
    @Matches(/^\+91\d{10}$/, { message: 'Alternate phone number must start with +91 and contain 10 digits' })
    alternatePhoneNumber: string;

    @ValidateNested()
    @Type(() => FacultyEmergencyContactDto)
    emergencyContact: FacultyEmergencyContactDto;

    // Address Details
    @ValidateNested()
    @Type(() => FacultyAddressDto)
    currentAddress: FacultyAddressDto;

    @IsBoolean()
    sameAsCurrent: boolean;

    @ValidateNested()
    @Type(() => FacultyAddressDto)
    @IsOptional()
    permanentAddress: FacultyAddressDto;

    // Employment Details
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @IsEnum(FacultyDesignation)
    designation: string;

    @IsString()
    @IsNotEmpty()
    departmentId: string;

    @IsEnum(EmploymentType)
    employmentType: string;

    @IsNumber()
    totalExperienceYears: number;

    @IsEnum(HighestQualification)
    highestQualification: string;

    @IsString()
    @IsOptional()
    remarks: string;

    // Education History
    @ValidateNested({ each: true })
    @Type(() => FacultyEducationHistoryDto)
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one education record is required' })
    educationHistory: FacultyEducationHistoryDto[];

    // Work Experience (Optional)
    @ValidateNested({ each: true })
    @Type(() => FacultyWorkExperienceDto)
    @IsArray()
    @IsOptional()
    workExperience: FacultyWorkExperienceDto[];
}