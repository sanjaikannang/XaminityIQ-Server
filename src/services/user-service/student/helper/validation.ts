import moment from "moment";
import { ExamMode, ExamStatus, ParticipantStatus } from "src/utils/enum";

// Determine if student can join the exam
export function canStudentJoin(
    exam: any,
    examStatus: ExamStatus,
    participantStatus: ParticipantStatus
): boolean {
    // Student cannot join if exam is not ONGOING
    if (examStatus !== ExamStatus.ONGOING) {
        return false;
    }

    // Student cannot join if they are REMOVED, REJECTED, FINISHED, or EXAM_ENDED
    if ([
        ParticipantStatus.REMOVED,
        ParticipantStatus.REJECTED,
        ParticipantStatus.FINISHED,
        ParticipantStatus.EXAM_ENDED
    ].includes(participantStatus)) {
        return false;
    }

    const now = moment();

    if (exam.examMode === ExamMode.PROCTORING) {
        const examDate = moment(exam.examDate).format('YYYY-MM-DD');
        const currentDate = now.format('YYYY-MM-DD');
        const currentTime = now.format('HH:mm');

        // Check if current date matches exam date
        if (currentDate !== examDate) {
            return false;
        }

        // Check if current time is within exam time window
        if (currentTime >= exam.startTime && currentTime <= exam.endTime) {
            return true;
        }

        return false;

    } else if (exam.examMode === ExamMode.AUTO) {
        const startDate = moment(exam.examStartDate).startOf('day');
        const endDate = moment(exam.examEndDate).endOf('day');

        // Check if current date is within exam date range
        if (now.isSameOrAfter(startDate) && now.isSameOrBefore(endDate)) {
            return true;
        }

        return false;
    }

    return false;
}