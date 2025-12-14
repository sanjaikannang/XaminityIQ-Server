export class DepartmentInfo {
    _id: string;
    deptCode: string;
    deptName: string;
}

export class GetDepartmentsByCourseResponse {
    success: boolean;
    message: string;
    data?: DepartmentInfo[];
}