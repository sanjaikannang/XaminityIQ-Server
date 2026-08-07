export class DepartmentInfo {
    _id: string;
    deptCode: string;
    deptName: string;
}

export class GetAllDepartmentsResponse {
    success: boolean;
    message: string;
    data?: DepartmentInfo[];
}
