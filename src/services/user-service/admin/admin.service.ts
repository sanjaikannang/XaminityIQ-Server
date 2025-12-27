import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { ulid } from "ulid";
import { Types } from "mongoose";
import { generateSectionName } from "src/utils/utils";
import { Nationality, StudentStatus, UserRole } from "src/utils/enum";
import { PasswordService } from "src/services/auth-service/password.service";

// Requests
import { CreateBatchRequest } from "src/api/user/admin/create-batch/create-batch.request";
import { MapCourseToBatchRequest } from "src/api/user/admin/map-course-to-batch/map-course-to-batch.request";
import { AddDepartmentToBatchCourseRequest } from "src/api/user/admin/add-department-to-batch-course/add-department-to-batch-course.request";
import { CreateStudentRequest } from "src/api/user/admin/student/create-student/create-student.request";

// Repositories
import { BatchRepositoryService } from "src/repositories/batch-repository/batch-repository";
import { CourseRepositoryService } from "src/repositories/course-repository/course-repository";
import { BatchCourseRepositoryService } from "src/repositories/batch-course-repository/batch-course-repository";
import { DepartmentRepositoryService } from "src/repositories/department-repository/department-repository";
import { BatchDepartmentRepositoryService } from "src/repositories/batch-department-repository/batch-department-repository";
import { SectionRepositoryService } from "src/repositories/section-repository/section-repository";
import { UserRepositoryService } from "src/repositories/user-repository/user.repository";
import { StudentContactInformationRepositoryService } from "src/repositories/student-contact-information-repository/student-contact-information-repository.service";
import { StudentPersonalDetailRepositoryService } from "src/repositories/student-personal-detail-repository/student-personal-detail-repository.service";
import { StudentAddressDetailRepositoryService } from "src/repositories/student-address-detail-repository/student-address-detail-repository.service";
import { StudentAcademicDetailRepositoryService } from "src/repositories/student-academic-detail-repository/student-academic-detail-repository.service";
import { StudentEducationHistoryRepositoryService } from "src/repositories/student-education-history-repository/student-education-history-repository.service";
import { StudentRepositoryService } from "src/repositories/student-repository/student-repository.service";
import { StudentParentDetailRepositoryService } from "src/repositories/student-parent-detail-repository/student-parent-detail-repository.service";


@Injectable()
export class AdminService {
    constructor(
        private readonly batchRepositoryService: BatchRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly batchCourseRepositoryService: BatchCourseRepositoryService,
        private readonly departmentRepositoryService: DepartmentRepositoryService,
        private readonly batchDepartmentRepositoryService: BatchDepartmentRepositoryService,
        private readonly sectionRepositoryService: SectionRepositoryService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly studentContactInformationRepositoryService: StudentContactInformationRepositoryService,
        private readonly studentPersonalDetailRepositoryService: StudentPersonalDetailRepositoryService,
        private readonly studentAddressDetailRepositoryService: StudentAddressDetailRepositoryService,
        private readonly studentAcademicDetailRepositoryService: StudentAcademicDetailRepositoryService,
        private readonly studentEducationHistoryRepositoryService: StudentEducationHistoryRepositoryService,
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly studentParentDetailRepositoryService: StudentParentDetailRepositoryService,
        private readonly passwordService: PasswordService,
    ) { }


    // Create Batch API Endpoint
    async createBatchAPI(createBatchData: CreateBatchRequest) {
        try {
            const { batchName, startYear, endYear } = createBatchData;

            // Check if batch already exists
            const existingBatch = await this.batchRepositoryService.findByBatchName(batchName);
            if (existingBatch) {
                throw new ConflictException('Batch already exists');
            }

            // Validate batch name matches start and end year
            const expectedBatchName = `${startYear}-${endYear}`;
            if (batchName !== expectedBatchName) {
                throw new BadRequestException(`Batch name must be based on start and end year`);
            }

            // Convert to numbers
            const startYearNum = parseInt(startYear);
            const endYearNum = parseInt(endYear);

            await this.batchRepositoryService.create({
                batchName,
                startYear: startYearNum,
                endYear: endYearNum
            });

        } catch (error) {
            if (error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create batch');
        }
    }


    // Map Course to Batch API Endpoint
    async mapCourseToBatchAPI(batchId: string, mapCourseData: MapCourseToBatchRequest) {
        try {
            const { courseId } = mapCourseData;

            // Verify batch exists
            const batch = await this.batchRepositoryService.findById(batchId);
            if (!batch) {
                throw new NotFoundException('Batch not found');
            }

            // Verify course exists
            const course = await this.courseRepositoryService.findById(courseId);
            if (!course) {
                throw new NotFoundException('Course not found');
            }

            // Calculate batch duration (in years)
            const batchDuration = batch.endYear - batch.startYear;

            // Extract course duration (format - "4 Years", "3 Years", etc.)
            const courseDurationMatch = course.duration.match(/^(\d+)\s*[Yy]ear/);
            if (!courseDurationMatch) {
                throw new BadRequestException('Invalid course duration format');
            }
            const courseDuration = parseInt(courseDurationMatch[1]);

            // Validate course duration matches batch duration
            if (courseDuration !== batchDuration) {
                throw new BadRequestException(
                    `Course duration (${courseDuration} years) does not match batch duration (${batchDuration} years)`
                );
            }

            // Check if mapping already exists
            const existingMapping = await this.batchCourseRepositoryService.findByBatchAndCourse(batchId, courseId);
            if (existingMapping) {
                throw new ConflictException('Course already mapped to this batch');
            }

            // Create batch-course mapping
            const batchCourse = await this.batchCourseRepositoryService.create({
                batchId,
                courseId
            });

            return (batchCourse._id as any).toString();

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to map course to batch');
        }

    }


    // Add Department to Batch-Course API Endpoint
    async addDepartmentToBatchCourseAPI(batchCourseId: string, addDeptData: AddDepartmentToBatchCourseRequest) {
        try {
            const { deptId, totalSeats, sectionCapacity } = addDeptData;

            // Verify batch-course mapping exists
            const batchCourse = await this.batchCourseRepositoryService.findById(batchCourseId);
            if (!batchCourse) {
                throw new NotFoundException('Batch-Course mapping not found');
            }

            // Verify department exists
            const department = await this.departmentRepositoryService.findById(deptId);
            if (!department) {
                throw new NotFoundException('Department not found');
            }

            // Verify department belongs to the course
            if (department.courseId.toString() !== batchCourse.courseId.toString()) {
                throw new BadRequestException('Department does not belong to the mapped course');
            }

            // Check if department already added to this batch-course
            const existingBatchDept = await this.batchDepartmentRepositoryService.findByBatchCourseAndDept(
                batchCourseId,
                deptId
            );
            if (existingBatchDept) {
                throw new ConflictException('Department already added to this batch-course');
            }

            const finalSectionCapacity = sectionCapacity || 50;

            // Validate totalSeats
            if (totalSeats <= 0) {
                throw new BadRequestException('Total seats must be greater than 0');
            }

            if (finalSectionCapacity <= 0) {
                throw new BadRequestException('Section capacity must be greater than 0');
            }

            if (totalSeats < finalSectionCapacity) {
                throw new BadRequestException('Total seats cannot be less than section capacity');
            }

            // Create batch-department mapping
            const batchDepartment = await this.batchDepartmentRepositoryService.create({
                batchCourseId,
                courseId: batchCourse.courseId.toString(),
                deptId,
                totalSeats,
                sectionCapacity: sectionCapacity || 50
            });

            // Calculate number of sections needed
            const numberOfSections = Math.ceil(totalSeats / finalSectionCapacity);

            // Generate sections with batchId, courseId, and departmentId
            const sections: Array<{
                batchId: Types.ObjectId;
                courseId: Types.ObjectId;
                departmentId: Types.ObjectId;
                sectionName: string;
                capacity: number;
                currentStrength: number;
            }> = [];

            for (let i = 0; i < numberOfSections; i++) {
                const sectionName = generateSectionName(i);

                // Calculate capacity for this section
                // Last section might have fewer seats
                const isLastSection = i === numberOfSections - 1;
                const capacity = isLastSection
                    ? totalSeats - (i * finalSectionCapacity)
                    : finalSectionCapacity;

                sections.push({
                    batchId: new Types.ObjectId(batchCourse.batchId.toString()),
                    courseId: new Types.ObjectId(batchCourse.courseId.toString()),
                    departmentId: new Types.ObjectId(deptId),
                    sectionName,
                    capacity,
                    currentStrength: 0
                });
            }

            // Create all sections in bulk
            await this.sectionRepositoryService.createMany(sections);

            return (batchDepartment._id as any).toString();

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to add department to batch-course');
        }
    }


    // Get All Batches API Endpoint
    async getAllBatchesAPI(queryParams: { page?: number; limit?: number; search?: string }) {
        try {
            const page = queryParams.page || 1;
            const limit = queryParams.limit || 10;
            const search = queryParams.search || '';

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Build search filter
            let searchFilter = {};
            if (search && search.trim() !== '') {
                searchFilter = {
                    batchName: { $regex: search, $options: 'i' }
                };
            }

            // Get total count for pagination
            const totalItems = await this.batchRepositoryService.countDocuments(searchFilter);

            // Get batches with pagination
            const batches = await this.batchRepositoryService.findWithPagination(
                searchFilter,
                skip,
                limit
            );

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalItems / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                batches: batches.map(batch => ({
                    _id: (batch._id as any).toString(),
                    batchName: batch.batchName,
                    startYear: batch.startYear,
                    endYear: batch.endYear,
                    createdAt: (batch as any).createdAt,
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage
                }
            };

        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch batches');
        }
    }


    // Get All Courses for Batch API Endpoint
    async getAllCoursesForBatchAPI(batchId: string, queryParams: { page?: number; limit?: number; search?: string }) {
        try {
            const page = queryParams.page || 1;
            const limit = queryParams.limit || 10;
            const search = queryParams.search || '';

            // Verify batch exists
            const batch = await this.batchRepositoryService.findById(batchId);
            if (!batch) {
                throw new NotFoundException('Batch not found');
            }

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Build search filter for courses
            let courseSearchFilter = {};
            if (search && search.trim() !== '') {
                courseSearchFilter = {
                    $or: [
                        { courseName: { $regex: search, $options: 'i' } },
                        { courseCode: { $regex: search, $options: 'i' } },
                        { streamName: { $regex: search, $options: 'i' } },
                        { streamCode: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            // Get total count for pagination
            const totalItems = await this.batchCourseRepositoryService.countCoursesForBatch(
                batchId,
                courseSearchFilter
            );

            // Get courses with pagination
            const coursesData = await this.batchCourseRepositoryService.findCoursesForBatchWithPagination(
                batchId,
                courseSearchFilter,
                skip,
                limit
            );

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalItems / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                courses: coursesData.map(item => {
                    const course = item.courseId as any;
                    return {
                        _id: course._id.toString(),
                        batchCourseId: (item._id as any).toString(),
                        streamCode: course.streamCode,
                        streamName: course.streamName,
                        courseCode: course.courseCode,
                        courseName: course.courseName,
                        level: course.level,
                        duration: course.duration,
                        semesters: course.semesters,
                        createdAt: course.createdAt,
                    };
                }),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage
                }
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch courses for batch');
        }
    }


    // Get All Departments for Batch-Course API Endpoint
    async getAllDepartmentsForBatchCourseAPI(
        batchCourseId: string,
        queryParams: { page?: number; limit?: number; search?: string }
    ) {
        try {
            const page = queryParams.page || 1;
            const limit = queryParams.limit || 10;
            const search = queryParams.search || '';

            // Verify batch-course mapping exists
            const batchCourse = await this.batchCourseRepositoryService.findById(batchCourseId);
            if (!batchCourse) {
                throw new NotFoundException('Batch-Course mapping not found');
            }

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Build search filter for departments
            let departmentSearchFilter = {};
            if (search && search.trim() !== '') {
                departmentSearchFilter = {
                    $or: [
                        { deptName: { $regex: search, $options: 'i' } },
                        { deptCode: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            // Get total count for pagination
            const totalItems = await this.batchDepartmentRepositoryService.countDepartmentsForBatchCourse(
                batchCourseId,
                departmentSearchFilter
            );

            // Get departments with pagination
            const departmentsData = await this.batchDepartmentRepositoryService.findDepartmentsForBatchCourseWithPagination(
                batchCourseId,
                departmentSearchFilter,
                skip,
                limit
            );

            // For each department, get its sections
            const departmentsWithSections = await Promise.all(
                departmentsData.map(async (batchDept) => {
                    const department = batchDept.deptId as any;

                    // Get sections for this department in this batch-course
                    const sections = await this.sectionRepositoryService.findByBatchCourseAndDepartment(
                        batchCourse.batchId.toString(),
                        batchCourse.courseId.toString(),
                        department._id.toString()
                    );

                    return {
                        _id: department._id.toString(),
                        batchDepartmentId: (batchDept._id as any).toString(),
                        deptCode: department.deptCode,
                        deptName: department.deptName,
                        totalSeats: batchDept.totalSeats,
                        sectionCapacity: batchDept.sectionCapacity,
                        sections: sections.map(section => ({
                            _id: (section._id as any).toString(),
                            sectionName: section.sectionName,
                            capacity: section.capacity,
                            currentStrength: section.currentStrength,
                            createdAt: (section as any).createdAt,
                        })),
                        createdAt: department.createdAt,
                    };
                })
            );

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalItems / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                departments: departmentsWithSections,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage
                }
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch departments for batch-course');
        }
    }


    // Get All Courses with Departments API Endpoint
    async getAllCoursesWithDepartmentsAPI(queryParams: { page?: number; limit?: number; search?: string }) {
        try {
            const page = queryParams.page || 1;
            const limit = queryParams.limit || 10;
            const search = queryParams.search || '';

            // Calculate skip value for pagination
            const skip = (page - 1) * limit;

            // Build search filter
            let searchFilter = {};
            if (search && search.trim() !== '') {
                searchFilter = {
                    streamCode: { $regex: search, $options: 'i' },
                    streamName: { $regex: search, $options: 'i' },
                    courseCode: { $regex: search, $options: 'i' },
                    courseName: { $regex: search, $options: 'i' },
                    level: { $regex: search, $options: 'i' }
                };
            }

            // Get total count for pagination
            const totalItems = await this.courseRepositoryService.countDocuments(searchFilter);

            // Get all courses
            const courses = await this.courseRepositoryService.findWithPagination(
                searchFilter,
                skip,
                limit
            );

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalItems / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            // For each course, get its departments
            const data = await Promise.all(
                courses.map(async (course) => {
                    const departments = await this.departmentRepositoryService.findByCourseId(
                        (course._id as any).toString()
                    );

                    return {
                        _id: (course._id as any).toString(),
                        streamCode: course.streamCode,
                        streamName: course.streamName,
                        courseCode: course.courseCode,
                        courseName: course.courseName,
                        level: course.level,
                        duration: course.duration,
                        semesters: course.semesters,
                        departments: departments.map(dept => ({
                            _id: (dept._id as any).toString(),
                            deptCode: dept.deptCode,
                            deptName: dept.deptName
                        }))
                    };
                })
            );

            return {
                data,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage
                }
            };

        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch courses with departments');
        }
    }


    // Get Courses by Batch Duration API Endpoint
    async getCoursesByBatchAPI(batchId: string) {
        try {
            // Verify batch exists
            const batch = await this.batchRepositoryService.findById(batchId);
            if (!batch) {
                throw new NotFoundException('Batch not found');
            }

            // Calculate batch duration (in years)
            const batchDuration = batch.endYear - batch.startYear;

            // Get all courses
            const allCourses = await this.courseRepositoryService.findAll();

            // Filter courses that match the batch duration
            const matchingCourses = allCourses.filter(course => {
                const courseDurationMatch = course.duration.match(/^(\d+)\s*[Yy]ear/);
                if (!courseDurationMatch) {
                    return false;
                }
                const courseDuration = parseInt(courseDurationMatch[1]);
                return courseDuration === batchDuration;
            });

            // Get already mapped courses for this batch
            const mappedCourses = await this.batchCourseRepositoryService.findByBatchId(batchId);
            const mappedCourseIds = mappedCourses.map(bc => bc.courseId.toString());

            // Filter out already mapped courses
            const availableCourses = matchingCourses.filter(
                course => !mappedCourseIds.includes((course._id as any).toString())
            );

            return availableCourses.map(course => ({
                _id: (course._id as any).toString(),
                courseCode: course.courseCode,
                courseName: course.courseName,
            }));

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch courses for batch');
        }
    }


    // Get Departments By Course API Endpoint
    async getDepartmentsByCourseAPI(courseId: string) {
        try {
            // Verify course exists
            const course = await this.courseRepositoryService.findById(courseId);
            if (!course) {
                throw new NotFoundException('Course not found');
            }

            // Get departments for this course
            const departments = await this.departmentRepositoryService.findByCourseId(courseId);

            return departments.map(dept => ({
                _id: (dept._id as any).toString(),
                deptCode: dept.deptCode,
                deptName: dept.deptName
            }));

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch departments for course');
        }
    }


    private async generateStudentEmail(firstName: string, lastName: string): Promise<string> {
        const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@college.edu`;
        const existingContact = await this.studentContactInformationRepositoryService.findByStudentEmail(baseEmail);

        if (!existingContact) {
            return baseEmail;
        }

        let counter = 1;
        let newEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@college.edu`;

        while (await this.studentContactInformationRepositoryService.findByStudentEmail(newEmail)) {
            counter++;
            newEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@college.edu`;
        }

        return newEmail;
    }


    // Create Student API Endpoint
    async createStudentAPI(createStudentData: CreateStudentRequest) {
        try {
            console.log("createStudentData", createStudentData)
            const session = await this.userRepositoryService.startSession();
            // console.log("session...", session)
            session.startTransaction();

            try {
                // Validate batch, course, department, section exist
                const batch = await this.batchRepositoryService.findById(createStudentData.batchId);
                if (!batch) {
                    throw new NotFoundException('Batch not found');
                }

                const course = await this.courseRepositoryService.findById(createStudentData.courseId);
                if (!course) {
                    throw new NotFoundException('Course not found');
                }

                const department = await this.departmentRepositoryService.findById(createStudentData.departmentId);
                if (!department) {
                    throw new NotFoundException('Department not found');
                }

                const section = await this.sectionRepositoryService.findById(createStudentData.sectionId);
                if (!section) {
                    throw new NotFoundException('Section not found');
                }

                // Check if personal email already exists
                const existingContactByPersonalEmail = await this.studentContactInformationRepositoryService.findByPersonalEmail(createStudentData.personalEmail);
                if (existingContactByPersonalEmail) {
                    throw new ConflictException('Personal email already exists');
                }

                // Generate student email
                const studentEmail = await this.generateStudentEmail(createStudentData.firstName, createStudentData.lastName);
                console.log("studentEmail...", studentEmail)

                // Generate student ID (UUID)
                const studentId = ulid();
                console.log("studentId...", studentId)

                // Generate roll number
                const rollNumber = "1234567890"
                console.log("rollNumber...", rollNumber)

                // Create User                
                const hashedPassword = await this.passwordService.hashPassword(createStudentData.dateOfBirth.toString());
                const user = await this.userRepositoryService.create({
                    email: studentEmail,
                    password: hashedPassword,
                    role: UserRole.STUDENT,
                    isActive: true,
                    isEmailVerified: false,
                    isFirstLogin: true,
                    isPasswordReset: false
                }, session);
                console.log("user...", user)

                // Create Personal Details
                const personalDetail = await this.studentPersonalDetailRepositoryService.create({
                    firstName: createStudentData.firstName,
                    lastName: createStudentData.lastName,
                    gender: createStudentData.gender,
                    dateOfBirth: createStudentData.dateOfBirth,
                    profilePhotoUrl: createStudentData.profilePhotoUrl,
                    nationality: Nationality.INDIAN,
                    religion: createStudentData.religion
                }, session);
                console.log("personalDetail...", personalDetail)

                // Create Contact Information
                const contactInformation = await this.studentContactInformationRepositoryService.create({
                    personalEmail: createStudentData.personalEmail,
                    studentEmail: studentEmail,
                    phoneNumber: createStudentData.phoneNumber,
                    alternatePhoneNumber: createStudentData.alternatePhoneNumber,
                    emergencyContact: createStudentData.emergencyContact
                }, session);
                console.log("contactInformation...", contactInformation)

                // Create Address Details
                const addressDetail = await this.studentAddressDetailRepositoryService.create({
                    currentAddress: createStudentData.currentAddress,
                    sameAsCurrent: createStudentData.sameAsCurrent,
                    permanentAddress: createStudentData.sameAsCurrent ? createStudentData.currentAddress : createStudentData.permanentAddress
                }, session);
                console.log("addressDetail...", addressDetail)

                // Create Academic Details
                const academicDetail = await this.studentAcademicDetailRepositoryService.create({
                    rollNumber: rollNumber,
                    batchId: new Types.ObjectId(createStudentData.batchId),
                    courseId: new Types.ObjectId(createStudentData.courseId),
                    departmentId: new Types.ObjectId(createStudentData.departmentId),
                    sectionId: new Types.ObjectId(createStudentData.sectionId),
                    currentSemester: createStudentData.currentSemester,
                    admissionType: createStudentData.admissionType,
                    status: StudentStatus.ACTIVE
                }, session);
                console.log("academicDetail...", academicDetail)

                // Create Student
                const student = await this.studentRepositoryService.create({
                    userId: user._id as Types.ObjectId,
                    studentId: studentId,
                    personalDetailId: personalDetail._id as Types.ObjectId,
                    contactInformationId: contactInformation._id as Types.ObjectId,
                    addressDetailId: addressDetail._id as Types.ObjectId,
                    academicDetailId: academicDetail._id as Types.ObjectId,
                    isActive: true
                }, session);
                console.log("student...", student)

                // Create Education History
                const educationHistoryPromises = createStudentData.educationHistory.map(edu =>
                    this.studentEducationHistoryRepositoryService.create({
                        studentId: student._id as Types.ObjectId,
                        level: edu.level,
                        qualification: edu.qualification,
                        boardOrUniversity: edu.boardOrUniversity,
                        institutionName: edu.institutionName,
                        yearOfPassing: edu.yearOfPassing,
                        percentageOrCGPA: edu.percentageOrCGPA,
                    }, session)
                );
                console.log("educationHistoryPromises...", educationHistoryPromises)
                await Promise.all(educationHistoryPromises);

                // Create Parent Details if provided
                if (createStudentData.father || createStudentData.mother || createStudentData.guardian) {
                    const parentDetail = await this.studentParentDetailRepositoryService.create({
                        studentId: student._id as Types.ObjectId,
                        father: createStudentData.father,
                        mother: createStudentData.mother,
                        guardian: createStudentData.guardian
                    }, session);

                    await this.studentRepositoryService.updateById(
                        student._id as Types.ObjectId,
                        {
                            parentDetailId: parentDetail._id as Types.ObjectId
                        },
                        session
                    );
                }

                await session.commitTransaction();
                return student;

            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create student');
        }
    }
}