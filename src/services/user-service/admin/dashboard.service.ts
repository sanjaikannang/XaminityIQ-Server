import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AttemptStatus, ExamMode, ExamStatus } from 'src/utils/enum';

// Response
import { DashboardOverviewData } from 'src/api/user/admin/dashboard/get-dashboard-overview/get-dashboard-overview.response';

// Repositories
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { FacultyRepositoryService } from 'src/repositories/faculty-repository/faculty.repository';
import { DepartmentRepositoryService } from 'src/repositories/department-repository/department.repository';
import { CourseRepositoryService } from 'src/repositories/course-repository/course.repository';
import { BatchRepositoryService } from 'src/repositories/batch-repository/batch.repository';
import { SubjectRepositoryService } from 'src/repositories/subject-repository/subject.repository';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamAttemptRepositoryService } from 'src/repositories/exam-attempt-repository/exam-attempt.repository';
import { AuthActivityLogRepositoryService } from 'src/repositories/auth-activity-log-repository/auth-activity-log.repository';

@Injectable()
export class DashboardService {
    constructor(
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly departmentRepositoryService: DepartmentRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly batchRepositoryService: BatchRepositoryService,
        private readonly subjectRepositoryService: SubjectRepositoryService,
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examAttemptRepositoryService: ExamAttemptRepositoryService,
        private readonly authActivityLogRepositoryService: AuthActivityLogRepositoryService,
    ) { }


    // Get Dashboard Overview API Endpoint — every headline metric, breakdown,
    // and feed the admin dashboard renders, assembled in one call
    async getDashboardOverviewAPI(): Promise<DashboardOverviewData> {
        const [
            totalStudents,
            activeStudents,
            totalFaculty,
            activeFaculty,
            departments,
            totalCourses,
            totalBatches,
            totalSubjects,
            totalExams,
            totalAttempts,
            flaggedAttempts,
        ] = await Promise.all([
            this.studentRepositoryService.countStudents({}),
            this.studentRepositoryService.countStudents({ isActive: true }),
            this.facultyRepositoryService.countFaculty({}),
            this.facultyRepositoryService.countFaculty({ isActive: true }),
            this.departmentRepositoryService.findAll(),
            this.courseRepositoryService.countDocuments({}),
            this.batchRepositoryService.countDocuments({}),
            this.subjectRepositoryService.countAll({}),
            this.examRepositoryService.countWithFilters({}),
            this.examAttemptRepositoryService.countDocuments({}),
            this.examAttemptRepositoryService.countDocuments({ isFlagged: true }),
        ]);

        const examsByStatus = await Promise.all(
            Object.values(ExamStatus).map(async (status) => ({
                status,
                count: await this.examRepositoryService.countWithFilters({ status }),
            })),
        );

        const examsByMode = await Promise.all(
            Object.values(ExamMode).map(async (mode) => ({
                status: mode,
                count: await this.examRepositoryService.countWithFilters({ mode }),
            })),
        );

        const attemptsByStatus = await Promise.all(
            Object.values(AttemptStatus).map(async (status) => ({
                status,
                count: await this.examAttemptRepositoryService.countDocuments({ status }),
            })),
        );

        const departmentDistribution = await Promise.all(
            departments.map(async (dept) => {
                const deptId = dept._id as Types.ObjectId;
                const [studentCount, facultyCount] = await Promise.all([
                    this.studentRepositoryService.countWithAcademicFilter(
                        { isActive: true },
                        { 'academicDetail.departmentId': deptId },
                    ),
                    this.facultyRepositoryService.countWithEmploymentFilter(
                        { isActive: true },
                        { 'employmentDetail.departmentId': deptId },
                    ),
                ]);
                return {
                    departmentId: deptId.toString(),
                    departmentName: dept.deptName,
                    studentCount,
                    facultyCount,
                };
            }),
        );

        const recentExamDocs = await this.examRepositoryService.findAllWithFilters({}, 0, 5, 'createdAt', 'desc');
        const recentExams = recentExamDocs.map((exam) => ({
            examId: (exam._id as Types.ObjectId).toString(),
            name: exam.name,
            mode: exam.mode,
            status: exam.status,
            createdAt: (exam as any).createdAt,
        }));

        const recentActivityDocs = await this.authActivityLogRepositoryService.findRecent(10);
        const recentActivity = recentActivityDocs.map((log) => ({
            email: log.email,
            role: log.role,
            action: log.action,
            createdAt: (log as any).createdAt,
        }));

        return {
            counts: {
                totalStudents,
                activeStudents,
                totalFaculty,
                activeFaculty,
                totalDepartments: departments.length,
                totalCourses,
                totalBatches,
                totalSubjects,
                totalExams,
                totalAttempts,
                flaggedAttempts,
            },
            examsByStatus,
            examsByMode,
            attemptsByStatus,
            departmentDistribution,
            recentExams,
            recentActivity,
        };
    }
}
