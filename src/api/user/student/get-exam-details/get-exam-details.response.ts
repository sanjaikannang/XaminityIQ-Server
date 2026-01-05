export class FacultyInfo {
    name: string;
    email: string;
    phone: string;
}

export class GetExamDetailsData {
    examName: string;
    examDate: Date;
    startTime: string;
    endTime: string;
    duration: number;
    mode: string;
    instructions: string[];
    // faculty: FacultyInfo;
}

export class GetExamDetailsResponse {

    success: boolean;
    message: string;
    data: GetExamDetailsData;

}
