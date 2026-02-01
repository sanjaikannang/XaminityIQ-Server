import moment from 'moment';
import { ObjectId } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { ExamStatus, ExamMode } from 'src/utils/enum';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';

@Injectable()
export class ExamStatusUpdaterService {
    constructor(
        private readonly examRepositoryService: ExamRepositoryService
    ) { }

    // Run every 2 seconds
    @Cron('*/2 * * * * *')
    async updateExamStatuses() {
        console.log('⏰ Cron fired at:', moment().format('YYYY-MM-DD HH:mm:ss'));
        try {
            // Get all exams that are UPCOMING or ONGOING
            const exams = await this.examRepositoryService.findAll({
                status: { $in: [ExamStatus.UPCOMING, ExamStatus.ONGOING] }
            });

            if (exams.length === 0) {
                console.log('No exams to update');
                return;
            }

            const now = moment();
            let updatedCount = 0;

            for (const exam of exams) {
                let newStatus: ExamStatus | null = null;

                console.log('\n--- Processing Exam ---');

                if (exam.examMode === ExamMode.PROCTORING) {
                    // Convert UTC date to local date and combine with time
                    const examDateLocal = moment(exam.examDate);
                    const examDateStr = examDateLocal.format('YYYY-MM-DD');

                    // Create datetime objects for comparison
                    const examDateTime = moment(`${examDateStr} ${exam.startTime}`, 'YYYY-MM-DD HH:mm');
                    const examEndDateTime = moment(`${examDateStr} ${exam.endTime}`, 'YYYY-MM-DD HH:mm');

                    if (now.isBefore(examDateTime) && exam.status !== ExamStatus.UPCOMING) {
                        newStatus = ExamStatus.UPCOMING;
                        console.log('→ Should update to UPCOMING');
                    } else if (now.isSameOrAfter(examDateTime) && now.isSameOrBefore(examEndDateTime) && exam.status !== ExamStatus.ONGOING) {
                        newStatus = ExamStatus.ONGOING;
                        console.log('→ Should update to ONGOING');
                    } else if (now.isAfter(examEndDateTime) && exam.status !== ExamStatus.COMPLETED) {
                        newStatus = ExamStatus.COMPLETED;
                        console.log('→ Should update to COMPLETED');
                    } else {
                        console.log('→ No status change needed');
                    }

                } else if (exam.examMode === ExamMode.AUTO) {
                    const startDate = moment(exam.examStartDate).startOf('day');
                    const endDate = moment(exam.examEndDate).endOf('day');

                    if (now.isBefore(startDate) && exam.status !== ExamStatus.UPCOMING) {
                        newStatus = ExamStatus.UPCOMING;
                        console.log('→ Should update to UPCOMING');
                    } else if (now.isSameOrAfter(startDate) && now.isSameOrBefore(endDate) && exam.status !== ExamStatus.ONGOING) {
                        newStatus = ExamStatus.ONGOING;
                        console.log('→ Should update to ONGOING');
                    } else if (now.isAfter(endDate) && exam.status !== ExamStatus.COMPLETED) {
                        newStatus = ExamStatus.COMPLETED;
                        console.log('→ Should update to COMPLETED');
                    } else {
                        console.log('→ No status change needed');
                    }
                }

                if (newStatus && newStatus !== exam.status) {
                    console.log(`🔄 Updating exam status from ${exam.status} to ${newStatus}`);
                    const result = await this.examRepositoryService.updateStatus(
                        (exam._id as ObjectId).toString(),
                        newStatus
                    );
                    updatedCount++;
                    console.log(`Updated exam ${exam._id} (${exam.examName}) status from ${exam.status} to ${newStatus}`);
                }
            }

            if (updatedCount > 0) {
                console.log(`Exam status update completed. Updated ${updatedCount} exam(s).`);
            }
        } catch (error) {
            console.log('Error updating exam statuses:', error);
            console.log('Full error:', error);
        }
    }
}