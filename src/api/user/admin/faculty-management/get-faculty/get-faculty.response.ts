export class PersonalDetails {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    maritalStatus: string;
    profilePhotoUrl: string;
    nationality: string;
    religion?: string;
}

export class EmergencyContact {
    name: string;
    relation: string;
    phoneNumber: string;
}

export class ContactDetails {
    personalEmail: string;
    facultyEmail: string;
    phoneNumber: string;
    alternatePhoneNumber?: string;
    emergencyContact: EmergencyContact;
}

export class Address {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export class AddressDetails {
    currentAddress: Address;
    sameAsCurrent: boolean;
    permanentAddress?: Address;
}

export class EmploymentDetails {
    employeeId: string;
    designation: string;
    departmentName: string;
    employmentType: string;
    dateOfJoining: Date;
    dateOfLeaving?: Date;
    totalExperienceYears: number;
    highestQualification: string;
    status: string;
    basicSalary?: number;
    remarks?: string;
}

export class EducationHistory {
    level: string;
    qualification: string;
    boardOrUniversity: string;
    institutionName: string;
    yearOfPassing: number;
    percentageOrCGPA: number;
    specialization?: string;
}

export class WorkExperience {
    organization: string;
    role: string;
    department?: string;
    fromDate: string;
    toDate: string;
    experienceYears: number;
    jobDescription?: string;
    reasonForLeaving?: string;
    isCurrent: boolean;
}

export class FacultyDetailData {
    facultyId: string;
    userId: string;
    personalDetails: PersonalDetails;
    contactDetails: ContactDetails;
    addressDetails: AddressDetails;
    employmentDetails: EmploymentDetails;
    educationHistory: EducationHistory[];
    workExperience: WorkExperience[];
    isActive: boolean;
}

export class GetFacultyResponse {
    success: boolean;
    message: string;
    data?: FacultyDetailData;
}