import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacultyRequest } from 'src/api/user/admin/create-faculty/create-faculty.request';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/utils/enum';
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


@Injectable()
export class AdminService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly adminRepositoryService: AdminRepositoryService,
        private readonly passwordService: PasswordService,
        private readonly sessionRepositoryService: SessionRepositoryService
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
}