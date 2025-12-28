export class FacultyPersonalData {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    profilePhotoUrl: string;
}

export class FacultyContactData {
    personalEmail: string;
    facultyEmail: string;
    phoneNumber: string;
}

export class FacultyEmploymentData {
    employeeId: string;
    designation: string;
    departmentName: string;
    employmentType: string;
    dateOfJoining: Date;
    status: string;
}

export class FacultyData {
    facultyId: string;
    personalDetails: FacultyPersonalData;
    contactDetails: FacultyContactData;
    employmentDetails: FacultyEmploymentData;
    isActive: boolean;
}

export class PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class GetAllFacultyResponse {
    success: boolean;
    message: string;
    data?: FacultyData[];
    pagination?: PaginationMeta;
}