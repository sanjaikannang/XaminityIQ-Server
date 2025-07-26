export class UserInfo {
    _id: string;
    email: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
}

export class Address {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

export class ContactInfo {
    phone: string;
    permanentAddress?: Address;
    currentAddress?: Address;
}

export class Qualification {
    degree?: string;
    institution?: string;
    year?: number;
    percentage?: number;
}

export class PreviousInstitution {
    institutionName?: string;
    designation?: string;
    duration?: string;
    from?: Date;
    to?: Date;
}

export class Experience {
    totalYears?: number;
    previousInstitutions?: PreviousInstitution[];
}

export class ProfessionalInfo {
    employeeId?: string;
    department: string;
    designation: string;
    qualification?: Qualification[];
    experience?: Experience;
}

export class FacultyResponse {
    _id: string;
    userId: UserInfo;
    facultyId: string;
    contactInfo: ContactInfo;
    professionalInfo: ProfessionalInfo;
    joiningDate: Date;
    status: string;
}

export class GetFacultyResponse {
    success: boolean;
    message: string;
    data: {
        faculty: FacultyResponse[];
    };
}