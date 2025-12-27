export class DepartmentInfo {
    _id: string;
    deptCode: string;
    deptName: string;
}

export class CourseWithDepartments {
    _id: string;
    streamCode: string;
    streamName: string;
    courseCode: string;
    courseName: string;
    level: string;
    duration: string;
    semesters: number;
    departments: DepartmentInfo[];
}

export class PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class GetAllCoursesWithDepartmentsResponse {
    success: boolean;
    message: string;
    data?: CourseWithDepartments[];
    pagination?: PaginationMeta;
}