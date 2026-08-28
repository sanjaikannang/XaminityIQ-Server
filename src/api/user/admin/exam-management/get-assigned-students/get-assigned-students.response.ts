export class AssignedStudentData {
    studentId: string;
    studentCode: string;
    studentName: string;
    studentEmail: string;
    attemptId: string | null;
    attemptStatus: string;
}

export class GetAssignedStudentsResponse {
    success: boolean;
    message: string;
    data?: { students: AssignedStudentData[] };
}
