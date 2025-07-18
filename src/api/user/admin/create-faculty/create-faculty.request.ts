import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, MaritalStatus } from 'src/utils/enum';

class PersonalInfoDto {

    @IsOptional()
    @IsString()
    photo?: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: Date;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsString()
    religion?: string;

    @IsOptional()
    @IsEnum(MaritalStatus)
    maritalStatus?: MaritalStatus;

}

class AddressDto {

    @IsOptional()
    @IsString()
    street?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    zipCode?: string;

    @IsOptional()
    @IsString()
    country?: string;

}

class ContactInfoDto {

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    permanentAddress?: AddressDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    currentAddress?: AddressDto;

}

class QualificationDto {

    @IsOptional()
    @IsString()
    degree?: string;

    @IsOptional()
    @IsString()
    institution?: string;

    @IsOptional()
    @IsNumber()
    year?: number;

    @IsOptional()
    @IsNumber()
    percentage?: number;

}

class PreviousInstitutionDto {

    @IsOptional()
    @IsString()
    institutionName?: string;

    @IsOptional()
    @IsString()
    designation?: string;

    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsDateString()
    from?: Date;

    @IsOptional()
    @IsDateString()
    to?: Date;

}

class ExperienceDto {

    @IsOptional()
    @IsNumber()
    totalYears?: number;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => PreviousInstitutionDto)
    previousInstitutions?: PreviousInstitutionDto[];

}

class ProfessionalInfoDto {

    @IsOptional()
    @IsString()
    employeeId?: string;

    @IsString()
    @IsNotEmpty()
    department: string;

    @IsString()
    @IsNotEmpty()
    designation: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => QualificationDto)
    qualification?: QualificationDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => ExperienceDto)
    experience?: ExperienceDto;

}

export class CreateFacultyRequest {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ValidateNested()
    @Type(() => PersonalInfoDto)
    personalInfo: PersonalInfoDto;

    @ValidateNested()
    @Type(() => ContactInfoDto)
    contactInfo: ContactInfoDto;

    @ValidateNested()
    @Type(() => ProfessionalInfoDto)
    professionalInfo: ProfessionalInfoDto;
    
}
