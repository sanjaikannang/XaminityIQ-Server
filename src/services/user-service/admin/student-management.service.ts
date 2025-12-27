import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { ulid } from "ulid";
import { Types } from "mongoose";
import { Nationality, StudentStatus, UserRole } from "src/utils/enum";
import { PasswordService } from "src/services/auth-service/password.service";

// Requests
import { CreateStudentRequest } from "src/api/user/admin/student-management/create-student/create-student.request";

// Repositories
import { BatchRepositoryService } from "src/repositories/batch-repository/batch.repository";
import { CourseRepositoryService } from "src/repositories/course-repository/course.repository";
import { DepartmentRepositoryService } from "src/repositories/department-repository/department.repository";
import { SectionRepositoryService } from "src/repositories/section-repository/section.repository";
import { UserRepositoryService } from "src/repositories/user-repository/user.repository";
import { StudentContactInformationRepositoryService } from "src/repositories/student-contact-information-repository/student-contact-information.repository";
import { StudentPersonalDetailRepositoryService } from "src/repositories/student-personal-detail-repository/student-personal-detail.repository";
import { StudentAddressDetailRepositoryService } from "src/repositories/student-address-detail-repository/student-address-detail.repository";
import { StudentAcademicDetailRepositoryService } from "src/repositories/student-academic-detail-repository/student-academic-detail.repository";
import { StudentEducationHistoryRepositoryService } from "src/repositories/student-education-history-repository/student-education-history.repository";
import { StudentRepositoryService } from "src/repositories/student-repository/student.repository";
import { StudentParentDetailRepositoryService } from "src/repositories/student-parent-detail-repository/student-parent-detail.repository";


@Injectable()
export class StudentManagementService {
    constructor(
        private readonly batchRepositoryService: BatchRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly departmentRepositoryService: DepartmentRepositoryService,
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