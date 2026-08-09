import { Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SubjectData } from 'src/api/user/faculty/subject-management/get-all-subjects/get-all-subjects.response';
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { StudentAcademicDetailRepositoryService } from 'src/repositories/student-academic-detail-repository/student-academic-detail.repository';
import { SubjectRepositoryService } from 'src/repositories/subject-repository/subject.repository';

@Injectable()
export class StudentService {
    constructor(
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly studentAcademicDetailRepositoryService: StudentAcademicDetailRepositoryService,
        private readonly subjectRepositoryService: SubjectRepositoryService,
    ) { }


    // Get My Subjects API Endpoint - fully derived from the authenticated student's
    // own batch/course/department/current semester, no client-supplied params
    async getMySubjectsAPI(userId: string): Promise<SubjectData[]> {
        const student = await this.studentRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!student) {
            throw new NotFoundException('Student profile not found');
        }

        const academicDetail = await this.studentAcademicDetailRepositoryService.findById(
            student.academicDetailId as Types.ObjectId,
        );
        if (!academicDetail) {
            throw new NotFoundException('Student academic details not found');
        }

        const subjects = await this.subjectRepositoryService.findByDepartmentAndSemester(
            academicDetail.departmentId,
            academicDetail.currentSemester,
        );

        return subjects.map((subject) => ({
            _id: (subject._id as Types.ObjectId).toString(),
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            semester: subject.semester,
            credits: subject.credits,
            subjectType: subject.subjectType,
            description: subject.description,
            createdAt: (subject as any).createdAt,
        }));
    }

}
