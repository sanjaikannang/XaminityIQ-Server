export class CourseData {
    _id: string;
    name: string;
    fullName: string;
    batchId: string;
    totalSemesters: number;
    durationYears: number;
    courseType: string;
    createdBy: string;
    status: string;
}

export class CreateCourseResponse {

    success: boolean;
    message: string;
    data?: CourseData

}