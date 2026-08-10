export class CountsSummary {
    totalStudents: number;
    activeStudents: number;
    totalFaculty: number;
    activeFaculty: number;
    totalDepartments: number;
    totalCourses: number;
    totalBatches: number;
    totalSubjects: number;
    totalExams: number;
    totalAttempts: number;
    flaggedAttempts: number;
}

export class StatusCount {
    status: string;
    count: number;
}

export class DepartmentDistribution {
    departmentId: string;
    departmentName: string;
    studentCount: number;
    facultyCount: number;
}

export class RecentExam {
    examId: string;
    name: string;
    mode: string;
    status: string;
    createdAt: Date;
}

export class RecentActivity {
    email: string;
    role: string;
    action: string;
    createdAt: Date;
}

export class DashboardOverviewData {
    counts: CountsSummary;
    examsByStatus: StatusCount[];
    examsByMode: StatusCount[];
    attemptsByStatus: StatusCount[];
    departmentDistribution: DepartmentDistribution[];
    recentExams: RecentExam[];
    recentActivity: RecentActivity[];
}

export class GetDashboardOverviewResponse {
    success: boolean;
    message: string;
    data?: DashboardOverviewData;
}
