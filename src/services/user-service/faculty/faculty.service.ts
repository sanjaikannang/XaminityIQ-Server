import { Types } from 'mongoose';
import { FacultyDesignation } from 'src/utils/enum';
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';

// Requests
import { CreateSubjectRequest } from 'src/api/user/faculty/subject-management/create-subject/create-subject.request';
import { EditSubjectRequest } from 'src/api/user/faculty/subject-management/edit-subject/edit-subject.request';
import { GetAllSubjectsRequest } from 'src/api/user/faculty/subject-management/get-all-subjects/get-all-subjects.request';

// Response
import { PaginationMeta, SubjectData } from 'src/api/user/faculty/subject-management/get-all-subjects/get-all-subjects.response';

// Repositories
import { FacultyRepositoryService } from 'src/repositories/faculty-repository/faculty.repository';
import { FacultyEmploymentDetailRepositoryService } from 'src/repositories/faculty-employment-detail-repository/faculty-employment-detail.repository';
import { DepartmentRepositoryService } from 'src/repositories/department-repository/department.repository';
import { CourseRepositoryService } from 'src/repositories/course-repository/course.repository';
import { SubjectRepositoryService } from 'src/repositories/subject-repository/subject.repository';

const SUBJECT_LIMIT_PER_SEMESTER = 6;

@Injectable()
export class FacultyService {
    constructor(
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly facultyEmploymentDetailRepositoryService: FacultyEmploymentDetailRepositoryService,
        private readonly departmentRepositoryService: DepartmentRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly subjectRepositoryService: SubjectRepositoryService,
    ) { }


    // Resolve the authenticated user's Faculty document and confirm they are an HOD,
    // returning the department they head. Every subject-management method below
    // relies on this instead of trusting any department id from the client.
    private async resolveHod(userId: string): Promise<{ facultyId: Types.ObjectId; departmentId: Types.ObjectId }> {
        const faculty = await this.facultyRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!faculty) {
            throw new NotFoundException('Faculty profile not found');
        }

        const employmentDetail = await this.facultyEmploymentDetailRepositoryService.findById(faculty.employmentDetailId);
        if (!employmentDetail) {
            throw new NotFoundException('Faculty employment details not found');
        }

        if (employmentDetail.designation !== FacultyDesignation.HOD) {
            throw new ForbiddenException('Only the Head of Department can manage subjects');
        }

        return {
            facultyId: faculty._id as Types.ObjectId,
            departmentId: employmentDetail.departmentId,
        };
    }


    // Validate that a semester falls within the department's course's total semester count
    private async validateSemesterBound(departmentId: Types.ObjectId, semester: number): Promise<void> {
        const department = await this.departmentRepositoryService.findById(departmentId.toString());
        if (!department) {
            throw new NotFoundException('Department not found');
        }

        const course = await this.courseRepositoryService.findById(department.courseId.toString());
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        if (semester < 1 || semester > course.semesters) {
            throw new BadRequestException(`Semester must be between 1 and ${course.semesters} for this department's course`);
        }
    }


    private mapSubject(subject: any): SubjectData {
        return {
            _id: subject._id.toString(),
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            semester: subject.semester,
            credits: subject.credits,
            subjectType: subject.subjectType,
            description: subject.description,
            createdAt: subject.createdAt,
        };
    }


    // Create Subject API Endpoint
    async createSubjectAPI(userId: string, data: CreateSubjectRequest) {
        const { departmentId, facultyId } = await this.resolveHod(userId);

        await this.validateSemesterBound(departmentId, data.semester);

        const existingCount = await this.subjectRepositoryService.countByDepartmentAndSemester(departmentId, data.semester);
        if (existingCount >= SUBJECT_LIMIT_PER_SEMESTER) {
            throw new ConflictException(`This semester already has the maximum of ${SUBJECT_LIMIT_PER_SEMESTER} subjects`);
        }

        const existingCode = await this.subjectRepositoryService.findByCode(data.subjectCode);
        if (existingCode) {
            throw new ConflictException('Subject code already in use');
        }

        return this.subjectRepositoryService.create({
            departmentId,
            semester: data.semester,
            subjectCode: data.subjectCode,
            subjectName: data.subjectName,
            credits: data.credits,
            subjectType: data.subjectType,
            description: data.description,
            createdBy: facultyId,
        });
    }


    // Get My (HOD's own department) Subjects API Endpoint
    async getMySubjectsAPI(
        userId: string,
        query: GetAllSubjectsRequest,
    ): Promise<{ subjects: SubjectData[]; pagination: PaginationMeta }> {
        const { departmentId } = await this.resolveHod(userId);

        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const filters = { semester: query.semester };

        const totalItems = await this.subjectRepositoryService.countByDepartment(departmentId, filters);
        const subjects = await this.subjectRepositoryService.findByDepartment(
            departmentId,
            filters,
            skip,
            limit,
            query.sortBy,
            query.sortOrder || 'asc',
        );

        const totalPages = Math.ceil(totalItems / limit);

        return {
            subjects: subjects.map((s) => this.mapSubject(s)),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }


    // Get Subject By Id API Endpoint (ownership-checked)
    async getSubjectByIdAPI(userId: string, subjectId: string): Promise<SubjectData> {
        const { departmentId } = await this.resolveHod(userId);

        const subject = await this.subjectRepositoryService.findById(subjectId);
        if (!subject || !subject.isActive || subject.departmentId.toString() !== departmentId.toString()) {
            throw new NotFoundException('Subject not found');
        }

        return this.mapSubject(subject);
    }


    // Edit Subject API Endpoint (ownership-checked)
    async editSubjectAPI(userId: string, subjectId: string, data: EditSubjectRequest): Promise<void> {
        const { departmentId } = await this.resolveHod(userId);

        const subject = await this.subjectRepositoryService.findById(subjectId);
        if (!subject || !subject.isActive || subject.departmentId.toString() !== departmentId.toString()) {
            throw new NotFoundException('Subject not found');
        }

        if (data.semester !== undefined) {
            await this.validateSemesterBound(departmentId, data.semester);

            if (data.semester !== subject.semester) {
                const existingCount = await this.subjectRepositoryService.countByDepartmentAndSemester(
                    departmentId,
                    data.semester,
                );
                if (existingCount >= SUBJECT_LIMIT_PER_SEMESTER) {
                    throw new ConflictException(`This semester already has the maximum of ${SUBJECT_LIMIT_PER_SEMESTER} subjects`);
                }
            }
        }

        if (data.subjectCode !== undefined && data.subjectCode !== subject.subjectCode) {
            const existingCode = await this.subjectRepositoryService.findByCode(data.subjectCode);
            if (existingCode) {
                throw new ConflictException('Subject code already in use');
            }
        }

        await this.subjectRepositoryService.updateById(subjectId, data);
    }


    // Delete Subject API Endpoint (ownership-checked, soft delete)
    async deleteSubjectAPI(userId: string, subjectId: string): Promise<void> {
        const { departmentId } = await this.resolveHod(userId);

        const subject = await this.subjectRepositoryService.findById(subjectId);
        if (!subject || !subject.isActive || subject.departmentId.toString() !== departmentId.toString()) {
            throw new NotFoundException('Subject not found');
        }

        await this.subjectRepositoryService.softDeleteById(subjectId);
    }

}
