export class StudentPersonalData {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    profilePhotoUrl: string;
}

export class StudentContactData {
    personalEmail: string;
    studentEmail: string;
    phoneNumber: string;
}

export class StudentAcademicData {
    rollNumber: string;
    batchName: string;
    courseName: string;
    departmentName: string;
    sectionName: string;
    currentSemester: number;
    status: string;
}

export class StudentsData {
    id: string;
    studentId: string;
    personalDetails: StudentPersonalData;
    contactDetails: StudentContactData;
    academicDetails: StudentAcademicData;
}

export class PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class GetAllStudentsResponse {
    success: boolean;
    message: string;
    data?: StudentsData[];
    pagination?: PaginationMeta;
}