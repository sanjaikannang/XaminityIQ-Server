import { ExamStatus } from 'src/utils/enum';

export class FacultyExamDto {
    examId: string;
    examName: string;
    examDate: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: ExamStatus;
    canJoin: boolean;
    totalStudents: number;
    joinedStudents: number;
}

export class GetFacultyExamsResponse {
    success: boolean;
    message: string;
    data: FacultyExamDto[];
}