import { BadRequestException } from "@nestjs/common";
import moment from "moment";
import { ExamMode } from "src/utils/enum";

// Validation method
export async function validateExamCreation(data: {
    examMode: ExamMode;
    examDate?: string;
    startTime?: string;
    endTime?: string;
    examStartDate?: string;
    examEndDate?: string;
    facultyId?: string;
    studentIds?: string[];
}) {
    if (data.examMode === ExamMode.PROCTORING) {
        // Validate PROCTORING mode
        if (!data.facultyId) {
            throw new BadRequestException('Faculty is required for PROCTORING mode');
        }

        if (!data.examDate || !data.startTime || !data.endTime) {
            throw new BadRequestException('Exam date, start time, and end time are required for PROCTORING mode');
        }

        if (!data.studentIds || data.studentIds.length !== 5) {
            throw new BadRequestException('Exactly 5 students are required for PROCTORING mode');
        }

        // Validate time range
        const start = moment(data.startTime, 'HH:mm');
        const end = moment(data.endTime, 'HH:mm');

        if (end.isSameOrBefore(start)) {
            throw new BadRequestException('End time must be after start time');
        }

    } else if (data.examMode === ExamMode.AUTO) {
        // Validate AUTO mode
        if (data.facultyId) {
            throw new BadRequestException('Faculty must not be assigned for AUTO mode');
        }

        if (!data.examStartDate || !data.examEndDate) {
            throw new BadRequestException('Exam start date and end date are required for AUTO mode');
        }

        // Validate date range
        const startDate = moment(data.examStartDate);
        const endDate = moment(data.examEndDate);

        if (endDate.isSameOrBefore(startDate)) {
            throw new BadRequestException('Exam end date must be after exam start date');
        }
    }
}