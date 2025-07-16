import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from 'src/utils/enum';

class StudentPersonalInfoDto {

    @IsOptional()
    @IsString()
    photo?: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsDateString()
    dateOfBirth: Date;

    @IsEnum(Gender)
    gender: Gender;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsString()
    religion?: string;

}

class StudentAddressDto {

    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    zipCode: string;

    @IsOptional()
    @IsString()
    country?: string;

}

class StudentContactInfoDto {

    @IsOptional()
    @IsString()
    phone?: string;

    @ValidateNested()
    @Type(() => StudentAddressDto)
    permanentAddress: StudentAddressDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => StudentAddressDto)
    currentAddress?: StudentAddressDto;

}

class ParentDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    occupation?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

}

class GuardianDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    relationship?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

}

class FamilyInfoDto {

    @ValidateNested()
    @Type(() => ParentDto)
    father: ParentDto;

    @ValidateNested()
    @Type(() => ParentDto)
    mother: ParentDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => GuardianDto)
    guardian?: GuardianDto;

}

class AcademicInfoDto {

    @IsString()
    @IsNotEmpty()
    course: string;

    @IsString()
    @IsNotEmpty()
    branch: string;

    @IsNumber()
    semester: number;

    @IsOptional()
    @IsString()
    section?: string;

    @IsString()
    @IsNotEmpty()
    batch: string;

    @IsNumber()
    admissionYear: number;

    @IsOptional()
    @IsNumber()
    expectedGraduationYear?: number;

}

export class CreateStudentRequest {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    rollNumber: string;

    @ValidateNested()
    @Type(() => StudentPersonalInfoDto)
    personalInfo: StudentPersonalInfoDto;

    @ValidateNested()
    @Type(() => StudentContactInfoDto)
    contactInfo: StudentContactInfoDto;

    @ValidateNested()
    @Type(() => FamilyInfoDto)
    familyInfo: FamilyInfoDto;

    @ValidateNested()
    @Type(() => AcademicInfoDto)
    academicInfo: AcademicInfoDto;

}
