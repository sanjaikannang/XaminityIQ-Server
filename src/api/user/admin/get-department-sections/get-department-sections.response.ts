export class SectionData {
    _id: string;
    sectionName: string;
    capacity: number;
    currentStrength: number;
    createdAt: Date;
}

export class DepartmentSectionsData {
    batchDepartmentId: string;
    batchId: string;
    batchName: string;
    courseId: string;
    courseName: string;
    deptId: string;
    deptCode: string;
    deptName: string;
    sections: SectionData[];
}

export class GetDepartmentSectionsResponse {
    success: boolean;
    message: string;
    data?: DepartmentSectionsData;
}
