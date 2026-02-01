import moment from 'moment';
import { ObjectId } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { ExamStatus, ExamMode } from 'src/utils/enum';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';

@Injectable()
export class ExamStatusUpdaterService {
    private readonly logger = new Logger(ExamStatusUpdaterService.name);

    constructor(
        private readonly examRepositoryService: ExamRepositoryService
    ) { }

    // Run every 3 seconds
    @Cron('*/2 * * * * *')
    async updateExamStatuses() {
        try {
            // Get all exams that are UPCOMING or ONGOING
            const exams = await this.examRepositoryService.findAll({
                status: { $in: [ExamStatus.UPCOMING, ExamStatus.ONGOING] }
            });

            if (exams.length === 0) {
                return; // No exams to update
            }

            const now = moment();
            let updatedCount = 0;

            for (const exam of exams) {
                let newStatus: ExamStatus | null = null;

                if (exam.examMode === ExamMode.PROCTORING) {
                    const examDate = moment(exam.examDate).format('YYYY-MM-DD');
                    const examDateTime = moment(`${examDate} ${exam.startTime}`, 'YYYY-MM-DD HH:mm');
                    const examEndDateTime = moment(`${examDate} ${exam.endTime}`, 'YYYY-MM-DD HH:mm');

                    if (now.isBefore(examDateTime) && exam.status !== ExamStatus.UPCOMING) {
                        newStatus = ExamStatus.UPCOMING;
                    } else if (now.isSameOrAfter(examDateTime) && now.isSameOrBefore(examEndDateTime) && exam.status !== ExamStatus.ONGOING) {
                        newStatus = ExamStatus.ONGOING;
                    } else if (now.isAfter(examEndDateTime) && exam.status !== ExamStatus.COMPLETED) {
                        newStatus = ExamStatus.COMPLETED;
                    }

                } else if (exam.examMode === ExamMode.AUTO) {
                    const startDate = moment(exam.examStartDate).startOf('day');
                    const endDate = moment(exam.examEndDate).endOf('day');

                    if (now.isBefore(startDate) && exam.status !== ExamStatus.UPCOMING) {
                        newStatus = ExamStatus.UPCOMING;
                    } else if (now.isSameOrAfter(startDate) && now.isSameOrBefore(endDate) && exam.status !== ExamStatus.ONGOING) {
                        newStatus = ExamStatus.ONGOING;
                    } else if (now.isAfter(endDate) && exam.status !== ExamStatus.COMPLETED) {
                        newStatus = ExamStatus.COMPLETED;
                    }
                }

                if (newStatus && newStatus !== exam.status) {
                    await this.examRepositoryService.updateStatus((exam._id as ObjectId).toString(), newStatus);
                    updatedCount++;
                    this.logger.log(`Updated exam ${exam._id} (${exam.examName}) status from ${exam.status} to ${newStatus}`);
                }
            }

            if (updatedCount > 0) {
                this.logger.log(`Exam status update completed. Updated ${updatedCount} exam(s).`);
            }
        } catch (error) {
            this.logger.error('Error updating exam statuses:', error);
        }
    }
}