import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { FacultyRepositoryService } from 'src/repositories/faculty-repository/faculty.repository';

@Injectable()
export class FacultyService {
    constructor(
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly examRepositoryService: ExamRepositoryService,
    ) { }


    // Get exam API
    async getFacultyExamAPI(facultyId: string) {
        try {
            // Verify faculty exists and is active
            const faculty = await this.facultyRepositoryService.findById(facultyId);

            if (!faculty) {
                throw new NotFoundException('Faculty not found');
            }
            
            const facultyDocumentId = (faculty._id as Types.ObjectId).toString()

            // Get all exams assigned to faculty
            const result = await this.examRepositoryService.getFacultyAssignedExams(facultyDocumentId);
            return result;

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to get faculty exam details: ' + error.message);
        }
    }

}