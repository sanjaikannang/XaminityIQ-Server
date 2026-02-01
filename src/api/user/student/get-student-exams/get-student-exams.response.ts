import { ExamStatus, ParticipantStatus, ExamMode } from 'src/utils/enum';

export class StudentExamDto {
    examId: string;
    examName: string;
    examMode: ExamMode;

    // PROCTORING mode fields
    examDate?: string;
    startTime?: string;
    endTime?: string;

    // AUTO mode fields
    examStartDate?: string;
    examEndDate?: string;

    duration: number;
    status: ExamStatus;
    myStatus: ParticipantStatus;
    canJoin: boolean;
    facultyName?: string;
    totalStudents: number;
}

export class GetStudentExamsResponse {
    success: boolean;
    message: string;
    data: StudentExamDto[];
}