export class CoursesData {
    _id: string;
    name: string;
    fullName: string;
    batchId: string;
    totalSemesters: number;
    durationYears: number;
    courseType: string;
    status: string;
}

export class GetCoursesByBatchResponse {

    success: boolean;
    message: string;
    data?: CoursesData[];

}