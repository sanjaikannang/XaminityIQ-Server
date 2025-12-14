export class CourseInfo {
    _id: string;   
    courseCode: string;
    courseName: string;    
}

export class GetCoursesByBatchResponse {
    success: boolean;
    message: string;
    data?: CourseInfo[];
}