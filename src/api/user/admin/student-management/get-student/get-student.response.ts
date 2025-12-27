export class PersonalDetails {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
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
    studentEmail: string;
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

export class AcademicDetails {
    rollNumber: string;
    batchName: string;
    courseName: string;
    departmentName: string;
    sectionName: string;
    currentSemester: number;
    admissionType: string;
    status: string;
}

export class EducationHistory {
    level: string;
    qualification: string;
    boardOrUniversity: string;
    institutionName: string;
    yearOfPassing: number;
    percentageOrCGPA: number;
    remarks?: string;
}

export class ParentInfo {
    name?: string;
    phoneNumber?: string;
    email?: string;
    occupation?: string;
}

export class GuardianInfo {
    name?: string;
    relation?: string;
    phoneNumber?: string;
    email?: string;
    occupation?: string;
}

export class ParentDetails {
    father?: ParentInfo;
    mother?: ParentInfo;
    guardian?: GuardianInfo;
}

export class StudentData {
    studentId: string;
    userId: string;
    personalDetails: PersonalDetails;
    contactDetails: ContactDetails;
    addressDetails: AddressDetails;
    academicDetails: AcademicDetails;
    educationHistory: EducationHistory[];
    parentDetails?: ParentDetails;
}

export class GetStudentResponse {
    success: boolean;
    message: string;
    data?: StudentData;
}