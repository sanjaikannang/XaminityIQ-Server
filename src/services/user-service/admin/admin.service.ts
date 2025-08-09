import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacultyRequest } from 'src/api/user/admin/create-faculty/create-faculty.request';
import * as bcrypt from 'bcrypt';
import { Status, UserRole } from 'src/utils/enum';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { FacultyRepositoryService } from 'src/repositories/faculty-repository/faculty.repository';
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { AdminRepositoryService } from 'src/repositories/admin-repository/admin.repository';
import { PasswordService } from 'src/services/auth-service/password.service';
import { CreateStudentRequest } from 'src/api/user/admin/create-student/create-student.request';
import { Types } from 'mongoose';
import { DeleteFacultyRequest } from 'src/api/user/admin/delete-faculty/delete-faculty.request';
import { DeleteStudentRequest } from 'src/api/user/admin/delete-student/delete-student.request';
import { SessionRepositoryService } from 'src/repositories/session-repository/session.repository';
import { GetAllFacultyRequest } from 'src/api/user/admin/get-all-faculty/get-all-faculty.request';
import { GetAllStudentRequest } from 'src/api/user/admin/get-all-student/get-all-student.request';
import { GetFacultyRequest } from 'src/api/user/admin/get-faculty/get-faculty.request';
import { GetStudentRequest } from 'src/api/user/admin/get-student/get-student.request';
import { CreateExamRequest } from 'src/api/user/admin/create-exam/create-exam.request';
import { CreateBatchRequest } from 'src/api/user/admin/create-batch/create-batch.request';
import { CreateCourseRequest } from 'src/api/user/admin/create-course/create-course.request';
import { CreateBranchRequest } from 'src/api/user/admin/create-branch/create-branch.request';
import { CreateSectionRequest } from 'src/api/user/admin/create-section/create-section.request';
import { GetBranchesByCourseRequest } from 'src/api/user/admin/get-branches-by-course/get-branches-by-course.request';
import { GetCoursesByBatchRequest } from 'src/api/user/admin/get-courses-by-batch/get-courses-by-batch.request';
import { GetSectionsByBranchRequest } from 'src/api/user/admin/get-sections-by-branch/get-sections-by-branch.request';
import { BatchRepositoryService } from 'src/repositories/batch-repository/batch-repository';
import { CourseRepositoryService } from 'src/repositories/course-repository/course-repository';
import { BranchRepositoryService } from 'src/repositories/branch-repository/branch-repository';
import { SectionRepositoryService } from 'src/repositories/section-repository/section-repository';


@Injectable()
export class AdminService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly adminRepositoryService: AdminRepositoryService,
        private readonly passwordService: PasswordService,
        private readonly sessionRepositoryService: SessionRepositoryService,
        private readonly batchRepositoryService: BatchRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly branchRepositoryService: BranchRepositoryService,
        private readonly sectionRepositoryService: SectionRepositoryService
    ) { }


    // Create Faculty API Endpoint
    async createFacultyUserAPI(adminId: string, createFacultyData: CreateFacultyRequest) {
        try {
            // Validate admin exists
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            // Check if email already exists
            const existingUser = await this.userRepositoryService.findUserByEmail(createFacultyData.email);
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            // Generate default password
            const defaultPassword = this.passwordService.generateRandomPassword();
            const hashedPassword = await this.passwordService.hashPassword(defaultPassword);

            // Create user
            const userData = {
                email: createFacultyData.email,
                password: hashedPassword,
                role: UserRole.FACULTY,
                isActive: true,
                isEmailVerified: false,
                isFirstLogin: true,
                isPasswordReset: false,
                createdBy: adminId,
                lastPasswordChange: new Date(),
            };

            const user = await this.userRepositoryService.createUser(userData);

            // Generate faculty ID
            const facultyId = await this.generateFacultyId();

            // Create faculty
            const facultyData = {
                userId: (user._id as Types.ObjectId).toString(),
                facultyId: facultyId,
                personalInfo: createFacultyData.personalInfo,
                contactInfo: createFacultyData.contactInfo,
                professionalInfo: createFacultyData.professionalInfo,
                joiningDate: new Date(),
            };

            const faculty = await this.facultyRepositoryService.createUser(facultyData);

            return {
                user: {
                    id: (user._id as Types.ObjectId).toString(),
                    email: user.email,
                    role: user.role,
                },
                faculty: {
                    id: (faculty._id as Types.ObjectId).toString(),
                    facultyId: faculty.facultyId,
                    personalInfo: faculty.personalInfo,
                    contactInfo: faculty.contactInfo,
                    professionalInfo: faculty.professionalInfo,
                },
                defaultPassword: defaultPassword,
            };

        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to create faculty user: ' + error.message);
        }
    }


    // Create Student API Endpoint
    async createStudentUserAPI(adminId: string, createStudentData: CreateStudentRequest) {
        try {
            // Validate admin exists
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            // Check if email already exists
            const existingUser = await this.userRepositoryService.findUserByEmail(createStudentData.email);
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            // Check if roll number already exists
            const existingStudent = await this.studentRepositoryService.findByRollNumber(createStudentData.rollNumber);
            if (existingStudent) {
                throw new ConflictException('Roll number already exists');
            }

            // Generate default password
            const defaultPassword = await this.passwordService.generateRandomPassword();
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            // Create user
            const userData = {
                email: createStudentData.email,
                password: hashedPassword,
                role: UserRole.STUDENT,
                isActive: true,
                isEmailVerified: false,
                isFirstLogin: true,
                isPasswordReset: false,
                createdBy: adminId,
                lastPasswordChange: new Date(),
            };

            const user = await this.userRepositoryService.createUser(userData);

            // Generate student ID
            const studentId = await this.generateStudentId();

            // Create student
            const studentData = {
                userId: (user._id as Types.ObjectId).toString(),
                studentId: studentId,
                rollNumber: createStudentData.rollNumber,
                personalInfo: createStudentData.personalInfo,
                contactInfo: createStudentData.contactInfo,
                familyInfo: createStudentData.familyInfo,
                academicInfo: createStudentData.academicInfo,
            };

            const student = await this.studentRepositoryService.createUser(studentData);

            return {
                user: {
                    id: (user._id as Types.ObjectId).toString(),
                    email: user.email,
                    role: user.role,
                },
                student: {
                    id: (student._id as Types.ObjectId).toString(),
                    studentId: student.studentId,
                    rollNumber: student.rollNumber,
                    personalInfo: student.personalInfo,
                    contactInfo: student.contactInfo,
                    familyInfo: student.familyInfo,
                    academicInfo: student.academicInfo,
                },
                defaultPassword: defaultPassword,
            };

        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to create student user: ' + error.message);
        }
    }


    // Generate Faculty ID
    async generateFacultyId(): Promise<string> {
        const lastFaculty = await this.facultyRepositoryService.findLastFaculty();
        let nextNumber = 1;

        if (lastFaculty && lastFaculty.facultyId) {
            const lastNumber = parseInt(lastFaculty.facultyId.replace('FAC', ''));
            nextNumber = lastNumber + 1;
        }

        return `FAC${nextNumber.toString().padStart(3, '0')}`;
    }


    // Generate Student ID
    async generateStudentId(): Promise<string> {
        const lastStudent = await this.studentRepositoryService.findLastStudent();
        let nextNumber = 1;

        if (lastStudent && lastStudent.studentId) {
            const lastNumber = parseInt(lastStudent.studentId.replace('STU', ''));
            nextNumber = lastNumber + 1;
        }

        return `STU${nextNumber.toString().padStart(3, '0')}`;
    }


    // Delete Faculty API Ednpoint
    async deleteFacultyAPI(adminId: string, deleteFacultyRequest: DeleteFacultyRequest) {
        try {
            // Validate admin exists
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            // Find the faculty record by ID
            const faculty = await this.facultyRepositoryService.findById(deleteFacultyRequest.id);
            if (!faculty) {
                throw new NotFoundException('Faculty not found');
            }

            // Get the associated user ID
            const userId = faculty.userId.toString();

            // Delete all user sessions first
            await this.sessionRepositoryService.deleteByUserId(userId);

            // Delete the faculty record
            await this.facultyRepositoryService.findByIdAndDelete(deleteFacultyRequest.id);

            // Delete the associated user record
            const userDeleted = await this.userRepositoryService.deleteById(userId);
            if (!userDeleted) {
                throw new BadRequestException('Failed to delete associated user record');
            }

            return {
                success: true,
                message: "Faculty Deleted Successfully"
            };

        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete faculty user: ' + error.message);
        }
    }


    // Delete Student API Endpoint
    async deleteStudentAPI(adminId: string, deleteStudentRequest: DeleteStudentRequest) {
        try {
            // Validate admin exists
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            // Find the student record by ID
            const student = await this.studentRepositoryService.findById(deleteStudentRequest.id);
            if (!student) {
                throw new NotFoundException('Student not found');
            }

            // Get the associated user ID
            const userId = student.userId.toString();

            // Delete all user sessions first
            await this.sessionRepositoryService.deleteByUserId(userId);

            // Delete the student record
            await this.studentRepositoryService.findByIdAndDelete(deleteStudentRequest.id);

            // Delete the associated user record
            const userDeleted = await this.userRepositoryService.deleteById(userId);
            if (!userDeleted) {
                throw new BadRequestException('Failed to delete associated user record');
            }

            return {
                success: true,
                message: "Student Deleted Successfully"
            };

        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete student user: ' + error.message);
        }
    }


    // Get All Faculty API Endpoint
    async getAllFacultyAPI(adminId: string, getAllFacultyRequest: GetAllFacultyRequest) {
        try {
            // Verify admin exists and is active
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            const { page = 1, limit = 10 } = getAllFacultyRequest;

            // Get faculty data from repository
            const result = await this.facultyRepositoryService.getAllFaculty(page, limit);

            const facultyData = result.faculty.map((faculty: any) => {

                const userId = faculty.userId || {};
                const personalInfo = faculty.personalInfo || {};
                const contactInfo = faculty.contactInfo || {};
                const professionalInfo = faculty.professionalInfo || {};

                return {
                    _id: faculty._id,
                    status: faculty.status,
                    facultyId: faculty.facultyId,
                    joiningDate: faculty.joiningDate,
                    userId: {
                        _id: userId._id,
                        email: userId.email,
                        role: userId.role,
                        isActive: userId.isActive,
                        isEmailVerified: userId.isEmailVerified,
                        lastLogin: userId.lastLogin,
                        createdAt: userId.createdAt
                    },
                    personalInfo: {
                        photo: personalInfo.photo,
                        firstName: personalInfo.firstName,
                        lastName: personalInfo.lastName,
                        dateOfBirth: personalInfo.dateOfBirth,
                        gender: personalInfo.gender,
                        nationality: personalInfo.nationality,
                        religion: personalInfo.religion,
                        maritalStatus: personalInfo.maritalStatus
                    },
                    contactInfo: {
                        phone: contactInfo.phone,
                        permanentAddress: contactInfo.permanentAddress || {},
                        currentAddress: contactInfo.currentAddress || {}
                    },
                    professionalInfo: {
                        employeeId: professionalInfo.employeeId,
                        department: professionalInfo.department,
                        designation: professionalInfo.designation,
                        qualification: professionalInfo.qualification || [],
                        experience: professionalInfo.experience || {}
                    },
                };
            });

            return {
                faculty: facultyData,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalCount: result.totalCount,
                    hasNextPage: result.hasNextPage,
                    hasPreviousPage: result.hasPrevPage
                }
            };

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to retrieve faculty data: ' + error.message);
        }
    }


    // Get All Student API Endpoint
    async getAllStudentAPI(adminId: string, getAllStudentRequest: GetAllStudentRequest) {
        try {
            // Verify admin exists and is active
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            const { page = 1, limit = 10 } = getAllStudentRequest;

            // Get faculty data from repository
            const result = await this.studentRepositoryService.getAllStudent(page, limit);

            const studentsData = result.students.map((student: any) => {

                const userId = student.userId || {};
                const personalInfo = student.personalInfo || {};
                const contactInfo = student.contactInfo || {};
                const familyInfo = student.familyInfo || {};
                const academicInfo = student.academicInfo || {};

                return {
                    _id: student._id,
                    status: student.status || '',
                    studentId: student.studentId || '',
                    rollNumber: student.rollNumber || '',
                    userId: {
                        _id: userId._id,
                        email: userId.email || '',
                        role: userId.role || '',
                        isActive: userId.isActive || false,
                        isEmailVerified: userId.isEmailVerified || false,
                        lastLogin: userId.lastLogin,
                        createdAt: userId.createdAt
                    },
                    personalInfo: {
                        photo: personalInfo.photo,
                        firstName: personalInfo.firstName || '',
                        lastName: personalInfo.lastName || '',
                        dateOfBirth: personalInfo.dateOfBirth,
                        gender: personalInfo.gender || '',
                        nationality: personalInfo.nationality,
                        religion: personalInfo.religion
                    },
                    contactInfo: {
                        phone: contactInfo.phone,
                        permanentAddress: {
                            street: contactInfo.permanentAddress?.street || '',
                            city: contactInfo.permanentAddress?.city || '',
                            state: contactInfo.permanentAddress?.state || '',
                            zipCode: contactInfo.permanentAddress?.zipCode || '',
                            country: contactInfo.permanentAddress?.country
                        },
                        currentAddress: contactInfo.currentAddress ? {
                            street: contactInfo.currentAddress.street,
                            city: contactInfo.currentAddress.city,
                            state: contactInfo.currentAddress.state,
                            zipCode: contactInfo.currentAddress.zipCode,
                            country: contactInfo.currentAddress.country
                        } : undefined
                    },
                    familyInfo: {
                        father: {
                            name: familyInfo.father?.name || '',
                            occupation: familyInfo.father?.occupation,
                            phone: familyInfo.father?.phone,
                            email: familyInfo.father?.email
                        },
                        mother: {
                            name: familyInfo.mother?.name || '',
                            occupation: familyInfo.mother?.occupation,
                            phone: familyInfo.mother?.phone,
                            email: familyInfo.mother?.email
                        },
                        guardian: familyInfo.guardian ? {
                            name: familyInfo.guardian.name,
                            relationship: familyInfo.guardian.relationship,
                            phone: familyInfo.guardian.phone,
                            email: familyInfo.guardian.email
                        } : undefined
                    },
                    academicInfo: {
                        course: academicInfo.course || '',
                        branch: academicInfo.branch || '',
                        semester: academicInfo.semester || 1,
                        section: academicInfo.section,
                        batch: academicInfo.batch || '',
                        admissionYear: academicInfo.admissionYear || new Date().getFullYear(),
                        expectedGraduationYear: academicInfo.expectedGraduationYear
                    },
                };
            }
            );

            return {
                students: studentsData,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalCount: result.totalCount,
                    hasNextPage: result.hasNextPage,
                    hasPreviousPage: result.hasPrevPage
                }
            };

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to retrieve student data: ' + error.message);
        }
    }


    // Get Faculty API Endpoint
    async getFacultyAPI(adminId: string, getFacultyRequest: GetFacultyRequest) {
        try {
            // Verify admin exists and is active
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            const { id } = getFacultyRequest;

            // Get faculty data from repository
            const result = await this.facultyRepositoryService.getFaculty(id);

            const facultyData = result.faculty.map((faculty: any) => {

                const userId = faculty.userId || {};
                const personalInfo = faculty.personalInfo || {};
                const contactInfo = faculty.contactInfo || {};
                const professionalInfo = faculty.professionalInfo || {};

                return {
                    _id: faculty._id,
                    status: faculty.status,
                    facultyId: faculty.facultyId,
                    joiningDate: faculty.joiningDate,
                    userId: {
                        _id: userId._id,
                        email: userId.email,
                        role: userId.role,
                        isActive: userId.isActive,
                        isEmailVerified: userId.isEmailVerified,
                        lastLogin: userId.lastLogin,
                        createdAt: userId.createdAt
                    },
                    personalInfo: {
                        photo: personalInfo.photo,
                        firstName: personalInfo.firstName,
                        lastName: personalInfo.lastName,
                        dateOfBirth: personalInfo.dateOfBirth,
                        gender: personalInfo.gender,
                        nationality: personalInfo.nationality,
                        religion: personalInfo.religion,
                        maritalStatus: personalInfo.maritalStatus
                    },
                    contactInfo: {
                        phone: contactInfo.phone,
                        permanentAddress: contactInfo.permanentAddress || {},
                        currentAddress: contactInfo.currentAddress || {}
                    },
                    professionalInfo: {
                        employeeId: professionalInfo.employeeId,
                        department: professionalInfo.department,
                        designation: professionalInfo.designation,
                        qualification: professionalInfo.qualification || [],
                        experience: professionalInfo.experience || {}
                    },
                };
            });

            return {
                faculty: facultyData,
            };

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to retrieve faculty data: ' + error.message);
        }
    }


    // Get Student API Endpoint
    async getStudentAPI(adminId: string, getStudentRequest: GetStudentRequest) {
        try {
            // Verify admin exists and is active
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            const { id } = getStudentRequest;

            // Get student data from repository
            const result = await this.studentRepositoryService.getStudent(id);

            // Transform the data to match response format
            const studentsData = result.students.map((student: any) => {

                const userId = student.userId || {};
                const personalInfo = student.personalInfo || {};
                const contactInfo = student.contactInfo || {};
                const familyInfo = student.familyInfo || {};
                const academicInfo = student.academicInfo || {};

                return {
                    _id: student._id,
                    status: student.status || '',
                    studentId: student.studentId || '',
                    rollNumber: student.rollNumber || '',
                    userId: {
                        _id: userId._id,
                        email: userId.email || '',
                        role: userId.role || '',
                        isActive: userId.isActive || false,
                        isEmailVerified: userId.isEmailVerified || false,
                        lastLogin: userId.lastLogin,
                        createdAt: userId.createdAt
                    },
                    personalInfo: {
                        photo: personalInfo.photo,
                        firstName: personalInfo.firstName || '',
                        lastName: personalInfo.lastName || '',
                        dateOfBirth: personalInfo.dateOfBirth,
                        gender: personalInfo.gender || '',
                        nationality: personalInfo.nationality,
                        religion: personalInfo.religion
                    },
                    contactInfo: {
                        phone: contactInfo.phone,
                        permanentAddress: {
                            street: contactInfo.permanentAddress?.street || '',
                            city: contactInfo.permanentAddress?.city || '',
                            state: contactInfo.permanentAddress?.state || '',
                            zipCode: contactInfo.permanentAddress?.zipCode || '',
                            country: contactInfo.permanentAddress?.country
                        },
                        currentAddress: contactInfo.currentAddress ? {
                            street: contactInfo.currentAddress.street,
                            city: contactInfo.currentAddress.city,
                            state: contactInfo.currentAddress.state,
                            zipCode: contactInfo.currentAddress.zipCode,
                            country: contactInfo.currentAddress.country
                        } : undefined
                    },
                    familyInfo: {
                        father: {
                            name: familyInfo.father?.name || '',
                            occupation: familyInfo.father?.occupation,
                            phone: familyInfo.father?.phone,
                            email: familyInfo.father?.email
                        },
                        mother: {
                            name: familyInfo.mother?.name || '',
                            occupation: familyInfo.mother?.occupation,
                            phone: familyInfo.mother?.phone,
                            email: familyInfo.mother?.email
                        },
                        guardian: familyInfo.guardian ? {
                            name: familyInfo.guardian.name,
                            relationship: familyInfo.guardian.relationship,
                            phone: familyInfo.guardian.phone,
                            email: familyInfo.guardian.email
                        } : undefined
                    },
                    academicInfo: {
                        course: academicInfo.course || '',
                        branch: academicInfo.branch || '',
                        semester: academicInfo.semester || 1,
                        section: academicInfo.section,
                        batch: academicInfo.batch || '',
                        admissionYear: academicInfo.admissionYear || new Date().getFullYear(),
                        expectedGraduationYear: academicInfo.expectedGraduationYear
                    },
                };
            }
            );

            return {
                students: studentsData,
            };

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to retrieve student data: ' + error.message);
        }
    }


    // Create Exam API Endpoint
    async createExamAPI(adminId: string, createExamData: CreateExamRequest) {

    }


    // Create Batch API Endpoint 
    async createBatchAPI(adminId: string, createBatchData: CreateBatchRequest) {
        try {
            // Verify admin exists and is active
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            // Generate batch name from years
            const batchName = `${createBatchData.startYear}-${createBatchData.endYear}`;

            // Check if batch name already exists
            const existingBatch = await this.batchRepositoryService.findByName(batchName);
            if (existingBatch) {
                throw new ConflictException(`Batch with name '${batchName}' already exists`);
            }

            // Create batch data
            const batchData = {
                name: batchName,
                startYear: createBatchData.startYear,
                endYear: createBatchData.endYear,
                createdBy: new Types.ObjectId(adminId)
            };

            // Create the batch
            const newBatch = await this.batchRepositoryService.create(batchData);

            // Transform to response format
            return {
                _id: (newBatch._id as Types.ObjectId).toString(),
                name: newBatch.name,
                startYear: newBatch.startYear,
                endYear: newBatch.endYear,
                createdBy: newBatch.createdBy.toString(),
                status: newBatch.status,
            };

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create batch: ' + error.message);
        }
    }


    // Create Course API Endpoint
    async createCourseAPI(adminId: string, createCourseData: CreateCourseRequest) {
        try {
            // Verify admin exists and is active
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            // Validate batch exists and is active
            const batch = await this.batchRepositoryService.findById(createCourseData.batchId);
            if (!batch) {
                throw new NotFoundException('Batch not found');
            }

            // Check if course with same name already exists for this batch
            const existingCourse = await this.courseRepositoryService.findOne({
                name: createCourseData.name,
                batchId: new Types.ObjectId(createCourseData.batchId)
            });

            if (existingCourse) {
                throw new BadRequestException(`Course with name '${createCourseData.name}' already exists for this batch`);
            }

            // Create course object
            const courseData = {
                name: createCourseData.name,
                fullName: createCourseData.fullName,
                batchId: new Types.ObjectId(createCourseData.batchId),
                totalSemesters: createCourseData.totalSemesters,
                durationYears: createCourseData.durationYears,
                courseType: createCourseData.courseType,
                createdBy: new Types.ObjectId(adminId),
                status: Status.ACTIVE
            };

            // Create course
            const createdCourse = await this.courseRepositoryService.create(courseData);

            // Return the created course data
            return {
                _id: (createdCourse._id as Types.ObjectId).toString(),
                name: createdCourse.name,
                fullName: createdCourse.fullName,
                batchId: createdCourse.batchId.toString(),
                totalSemesters: createdCourse.totalSemesters,
                durationYears: createdCourse.durationYears,
                courseType: createdCourse.courseType,
                createdBy: createdCourse.createdBy.toString(),
                status: createdCourse.status,
            };

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create course: ' + error.message);
        }
    }


    // Create Branch API Endpoint
    async createBranchAPI(adminId: string, createBranchData: CreateBranchRequest) {
        try {
            // Verify admin exists and is active
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            // Validate course exists and is active
            const course = await this.courseRepositoryService.findById(createBranchData.courseId);
            if (!course) {
                throw new NotFoundException('Course not found');
            }

            // Convert courseId string to ObjectId for database queries
            const courseObjectId = new Types.ObjectId(createBranchData.courseId);

            // Check if branch with same name already exists for this course
            const existingBranchByName = await this.branchRepositoryService.findOne({
                name: createBranchData.name,
                courseId: courseObjectId
            });

            if (existingBranchByName) {
                throw new BadRequestException(`Branch with name '${createBranchData.name}' already exists for this course`);
            }

            // Check if branch with same code already exists for this course
            const existingBranchByCode = await this.branchRepositoryService.findOne({
                code: createBranchData.code,
                courseId: courseObjectId
            });

            if (existingBranchByCode) {
                throw new BadRequestException(`Branch with code '${createBranchData.code}' already exists for this course`);
            }

            // Create branch object
            const branchData = {
                name: createBranchData.name,
                code: createBranchData.code,
                courseId: courseObjectId,
                createdBy: new Types.ObjectId(adminId),
                status: Status.ACTIVE
            };

            // Create branch
            const createdBranch = await this.branchRepositoryService.create(branchData);

            // Return the created branch data
            return {
                _id: (createdBranch._id as Types.ObjectId).toString(),
                name: createdBranch.name,
                code: createdBranch.code,
                courseId: createdBranch.courseId.toString(),
                createdBy: createdBranch.createdBy.toString(),
                status: createdBranch.status,
            };

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create branch: ' + error.message);
        }
    }


    // Create Section API Endpoint
    async createSectionAPI(adminId: string, createSectionData: CreateSectionRequest) {
        try {
            // Verify admin exists and is active
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            // Validate branch exists and is active
            const branch = await this.branchRepositoryService.findById(createSectionData.branchId);
            if (!branch) {
                throw new NotFoundException('Branch not found');
            }

            // Convert branchId string to ObjectId for database queries
            const branchObjectId = new Types.ObjectId(createSectionData.branchId);

            // Check if section with same name already exists for this branch
            const existingSectionByName = await this.sectionRepositoryService.findOne({
                name: createSectionData.name,
                branchId: branchObjectId
            });

            if (existingSectionByName) {
                throw new BadRequestException(`Section with name '${createSectionData.name}' already exists for this branch`);
            }

            // Create section object
            const sectionData = {
                name: createSectionData.name,
                branchId: branchObjectId,
                capacity: createSectionData.capacity,
                createdBy: new Types.ObjectId(adminId),
                status: Status.ACTIVE
            };

            // Create section
            const createdSection = await this.sectionRepositoryService.create(sectionData);

            // Return the created section data
            return {
                _id: (createdSection._id as Types.ObjectId).toString(),
                name: createdSection.name,
                branchId: createdSection.branchId.toString(),
                capacity: createdSection.capacity,
                createdBy: createdSection.createdBy.toString(),
                status: createdSection.status,
            };

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create section: ' + error.message);
        }
    }


    // Get Batches API Endpoint
    async getBatchesAPI(adminId: string) {
        try {
            // Verify admin exists and is active
            const admin = await this.adminRepositoryService.findByUserId(adminId);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }

            const batches = await this.batchRepositoryService.findAllBatches();

            const result = batches.map(batch => ({
                _id: (batch._id as Types.ObjectId).toString(),
                name: batch.name,
            }));

            return result;

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to get batchs: ' + error.message);
        }

    }


    // Get Branches By Course API Endpoint
    async getBranchesByCourseAPI(adminId: string, getBranchesByCourseData: GetBranchesByCourseRequest) {
        try {

        } catch (error) {

        }
    }


    // Get Courses By Batch API Endpoint
    async getCoursesByBatchAPI(adminId: string, getCoursesByBatchData: GetCoursesByBatchRequest) {
        try {

        } catch (error) {

        }
    }


    // Get Sections By Branch API Endpoint
    async getSectionsByBranchAPI(adminId: string, getSectionsByBranchData: GetSectionsByBranchRequest) {
        try {

        } catch (error) {

        }
    }

}