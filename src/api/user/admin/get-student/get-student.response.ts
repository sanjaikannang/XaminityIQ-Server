export class UserInfo {
    _id: string;
    email: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
}

export class PersonalInfo {
    photo?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    nationality?: string;
    religion?: string;
}

export class Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
}

export class ContactInfo {
    phone?: string;
    permanentAddress: Address;
    currentAddress?: Address;
}

export class ParentInfo {
    name: string;
    occupation?: string;
    phone?: string;
    email?: string;
}

export class GuardianInfo {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
}

export class FamilyInfo {
    father: ParentInfo;
    mother: ParentInfo;
    guardian?: GuardianInfo;
}

export class AcademicInfo {
    course: string;
    branch: string;
    semester: number;
    section?: string;
    batch: string;
    admissionYear: number;
    expectedGraduationYear?: number;
}

export class StudentResponse {
    _id: string;
    userId: UserInfo;
    studentId: string;
    rollNumber: string;
    personalInfo: PersonalInfo;
    contactInfo: ContactInfo;
    familyInfo: FamilyInfo;
    academicInfo: AcademicInfo;
    status: string;
}

export class GetStudentResponse {
    success: boolean;
    message: string;
    data: {
        students: StudentResponse[];
    };
}