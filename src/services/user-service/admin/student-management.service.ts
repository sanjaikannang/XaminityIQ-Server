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
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { PasswordService } from "src/services/auth-service/password.service";
import { StudentParentDetailDocument } from "src/schemas/User/Student/studentParentDetail.schema";

// Requests
import { CreateStudentRequest } from "src/api/user/admin/student-management/create-student/create-student.request";
import { GetAllStudentsRequest } from "src/api/user/admin/student-management/get-all-students/get-all-students.request";
import { BulkUploadStudentsRequest } from "src/api/user/admin/student-management/bulk-upload-student/bulk-upload-students.request";

// Response
import { PaginationMeta } from "src/api/user/admin/get-all-batches/get-all-batches.response";
import { StudentsData } from "src/api/user/admin/student-management/get-all-students/get-all-students.response";
import { StudentData } from "src/api/user/admin/student-management/get-student/get-student.response";
import { BulkUploadSummary, StudentUploadResult } from "src/api/user/admin/student-management/bulk-upload-student/bulk-upload-students.response";

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
        private readonly cloudinaryService: CloudinaryService,
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


    // Generate Student Email
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


    // Generate Roll Number
    private async generateRollNumber(batchId: Types.ObjectId, departmentId: Types.ObjectId): Promise<string> {
        const batch = await this.batchRepositoryService.findById(batchId.toString());
        if (!batch) throw new Error('Batch not found');

        const department = await this.departmentRepositoryService.findById(departmentId.toString());
        if (!department) throw new Error('Department not found');

        const count = await this.studentAcademicDetailRepositoryService.countByBatchAndDepartment(batchId, departmentId);

        const batchYear = batch.startYear.toString().slice(-2);
        const deptCode = department.deptCode.substring(0, 3).toUpperCase();
        const sequence = (count + 1).toString().padStart(4, '0');

        return `${batchYear}${deptCode}${sequence}`;
    }


    // Create Student API Endpoint
    async createStudentAPI(createStudentData: CreateStudentRequest) {
        let profilePhotoUrl: string | null = null;

        try {
            console.log("createStudentData", createStudentData)
            const session = await this.userRepositoryService.startSession();
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

                // Check if phone number already exists
                const existingContactByPhone = await this.studentContactInformationRepositoryService.findByPhoneNumber(createStudentData.phoneNumber);
                if (existingContactByPhone) {
                    throw new ConflictException('Phone number already exists');
                }

                // Upload profile photo to Cloudinary
                // const profilePhotoUrl = await this.cloudinaryService.uploadImage(
                //     profilePhotoBuffer,
                //     'students/profile-photos'
                // );
                // console.log("profilePhotoUrl...", profilePhotoUrl);

                // Generate student email
                const studentEmail = await this.generateStudentEmail(createStudentData.firstName, createStudentData.lastName);
                console.log("studentEmail...", studentEmail)

                // Generate student ID (UUID)
                const studentId = ulid();
                console.log("studentId...", studentId)

                // Generate roll number
                const rollNumber = await this.generateRollNumber(
                    new Types.ObjectId(createStudentData.batchId),
                    new Types.ObjectId(createStudentData.departmentId)
                );
                console.log("rollNumber...", rollNumber);

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

                // If transaction fails, delete uploaded image from Cloudinary
                if (profilePhotoUrl) {
                    try {
                        await this.cloudinaryService.deleteImage(profilePhotoUrl);
                        console.log("Deleted uploaded image due to transaction failure");
                    } catch (deleteError) {
                        console.error('Failed to delete image from Cloudinary:', deleteError);
                    }
                }

                throw error;
            } finally {
                session.endSession();
            }

        } catch (error) {
            // If error occurs before transaction, still clean up uploaded image
            if (profilePhotoUrl && !error.message?.includes('transaction')) {
                try {
                    await this.cloudinaryService.deleteImage(profilePhotoUrl);
                    console.log("Deleted uploaded image due to error");
                } catch (deleteError) {
                    console.error('Failed to delete image from Cloudinary:', deleteError);
                }
            }

            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create student');
        }
    }


    // Get All Students API Endpoint
    async getAllStudentsAPI(
        query: GetAllStudentsRequest
    ): Promise<{ students: StudentsData[]; pagination: PaginationMeta }> {
        try {
            const page = query.page ?? 1;
            const limit = query.limit ?? 10;
            const search = query.search ?? '';
            const skip = (page - 1) * limit;

            // Build search filter
            const searchFilter: any = search
                ? {
                    $or: [{ studentId: { $regex: search, $options: 'i' } }],
                }
                : {};

            // Get total count
            const totalItems =
                await this.studentRepositoryService.countStudents(searchFilter);

            // Get students
            const students =
                await this.studentRepositoryService.findAllWithDetails(
                    searchFilter,
                    skip,
                    limit
                );

            const studentsData: StudentsData[] = [];

            for (const student of students) {
                const personalDetail =
                    await this.studentPersonalDetailRepositoryService.findById(
                        student.personalDetailId
                    );
                if (!personalDetail) {
                    throw new NotFoundException(
                        'Student personal detail not found'
                    );
                }

                const contactInfo =
                    await this.studentContactInformationRepositoryService.findById(
                        student.contactInformationId
                    );
                if (!contactInfo) {
                    throw new NotFoundException(
                        'Student contact information not found'
                    );
                }

                const academicDetail =
                    await this.studentAcademicDetailRepositoryService.findById(
                        student.academicDetailId
                    );
                if (!academicDetail) {
                    throw new NotFoundException(
                        'Student academic detail not found'
                    );
                }

                const batch = await this.batchRepositoryService.findById(
                    academicDetail.batchId.toString()
                );
                if (!batch) {
                    throw new NotFoundException('Batch not found');
                }

                const course = await this.courseRepositoryService.findById(
                    academicDetail.courseId.toString()
                );
                if (!course) {
                    throw new NotFoundException('Course not found');
                }

                const department =
                    await this.departmentRepositoryService.findById(
                        academicDetail.departmentId.toString()
                    );
                if (!department) {
                    throw new NotFoundException('Department not found');
                }

                const section = await this.sectionRepositoryService.findById(
                    academicDetail.sectionId.toString()
                );
                if (!section) {
                    throw new NotFoundException('Section not found');
                }

                studentsData.push({
                    id: student.id,
                    studentId: student.studentId,
                    personalDetails: {
                        firstName: personalDetail.firstName,
                        lastName: personalDetail.lastName,
                        gender: personalDetail.gender,
                        dateOfBirth: personalDetail.dateOfBirth,
                        profilePhotoUrl: personalDetail.profilePhotoUrl,
                    },
                    contactDetails: {
                        personalEmail: contactInfo.personalEmail,
                        studentEmail: contactInfo.studentEmail,
                        phoneNumber: contactInfo.phoneNumber,
                    },
                    academicDetails: {
                        rollNumber: academicDetail.rollNumber,
                        batchName: batch.batchName,
                        courseName: course.courseName,
                        departmentName: department.deptName,
                        sectionName: section.sectionName,
                        currentSemester: academicDetail.currentSemester,
                        status: academicDetail.status,
                    },
                });
            }

            // Pagination metadata
            const totalPages = Math.ceil(totalItems / limit);

            const pagination: PaginationMeta = {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            };

            return {
                students: studentsData,
                pagination,
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to fetch students'
            );
        }
    }


    // Get Students By ID API Endpoint
    async getStudentByIdAPI(id: string): Promise<StudentData> {
        try {
            // Find student
            const student = await this.studentRepositoryService.findById(
                new Types.ObjectId(id),
            );

            if (!student) {
                throw new NotFoundException('Student not found');
            }

            // Fetch required related entities
            const personalDetail =
                await this.studentPersonalDetailRepositoryService.findById(
                    student.personalDetailId,
                );
            if (!personalDetail) {
                throw new NotFoundException('Student personal details not found');
            }

            const contactInfo =
                await this.studentContactInformationRepositoryService.findById(
                    student.contactInformationId,
                );
            if (!contactInfo) {
                throw new NotFoundException('Student contact details not found');
            }

            const addressDetail =
                await this.studentAddressDetailRepositoryService.findById(
                    student.addressDetailId,
                );
            if (!addressDetail) {
                throw new NotFoundException('Student address details not found');
            }

            const academicDetail =
                await this.studentAcademicDetailRepositoryService.findById(
                    student.academicDetailId,
                );
            if (!academicDetail) {
                throw new NotFoundException('Student academic details not found');
            }

            // Optional entities
            const educationHistory =
                await this.studentEducationHistoryRepositoryService.findByStudentId(
                    student._id as Types.ObjectId,
                );

            let parentDetail: StudentParentDetailDocument | null = null;
            if (student.parentDetailId) {
                parentDetail =
                    await this.studentParentDetailRepositoryService.findByStudentId(
                        student._id as Types.ObjectId,
                    );
            }

            // Lookup academic references
            const batch = await this.batchRepositoryService.findById(
                academicDetail.batchId.toString(),
            );
            if (!batch) {
                throw new NotFoundException('Batch not found');
            }

            const course = await this.courseRepositoryService.findById(
                academicDetail.courseId.toString(),
            );
            if (!course) {
                throw new NotFoundException('Course not found');
            }

            const department = await this.departmentRepositoryService.findById(
                academicDetail.departmentId.toString(),
            );
            if (!department) {
                throw new NotFoundException('Department not found');
            }

            const section = await this.sectionRepositoryService.findById(
                academicDetail.sectionId.toString(),
            );
            if (!section) {
                throw new NotFoundException('Section not found');
            }

            // Map to response DTO
            const studentData: StudentData = {
                studentId: student.studentId,
                userId: student.userId.toString(),

                personalDetails: {
                    firstName: personalDetail.firstName,
                    lastName: personalDetail.lastName,
                    gender: personalDetail.gender,
                    dateOfBirth: personalDetail.dateOfBirth,
                    profilePhotoUrl: personalDetail.profilePhotoUrl,
                    nationality: personalDetail.nationality,
                    religion: personalDetail.religion,
                },

                contactDetails: {
                    personalEmail: contactInfo.personalEmail,
                    studentEmail: contactInfo.studentEmail,
                    phoneNumber: contactInfo.phoneNumber,
                    alternatePhoneNumber: contactInfo.alternatePhoneNumber,
                    emergencyContact: {
                        name: contactInfo.emergencyContact.name,
                        relation: contactInfo.emergencyContact.relation,
                        phoneNumber: contactInfo.emergencyContact.phoneNumber,
                    },
                },

                addressDetails: {
                    currentAddress: {
                        addressLine1: addressDetail.currentAddress.addressLine1,
                        addressLine2: addressDetail.currentAddress.addressLine2,
                        city: addressDetail.currentAddress.city,
                        state: addressDetail.currentAddress.state,
                        pincode: addressDetail.currentAddress.pincode,
                        country: addressDetail.currentAddress.country,
                    },
                    sameAsCurrent: addressDetail.sameAsCurrent,
                    permanentAddress: addressDetail.permanentAddress
                        ? {
                            addressLine1:
                                addressDetail.permanentAddress.addressLine1,
                            addressLine2:
                                addressDetail.permanentAddress.addressLine2,
                            city: addressDetail.permanentAddress.city,
                            state: addressDetail.permanentAddress.state,
                            pincode: addressDetail.permanentAddress.pincode,
                            country: addressDetail.permanentAddress.country,
                        }
                        : undefined,
                },

                academicDetails: {
                    rollNumber: academicDetail.rollNumber,
                    batchName: batch.batchName,
                    courseName: course.courseName,
                    departmentName: department.deptName,
                    sectionName: section.sectionName,
                    currentSemester: academicDetail.currentSemester,
                    admissionType: academicDetail.admissionType,
                    status: academicDetail.status,
                },

                educationHistory: educationHistory.map((edu) => ({
                    level: edu.level,
                    qualification: edu.qualification,
                    boardOrUniversity: edu.boardOrUniversity,
                    institutionName: edu.institutionName,
                    yearOfPassing: edu.yearOfPassing,
                    percentageOrCGPA: edu.percentageOrCGPA,
                    remarks: edu.remarks,
                })),

                parentDetails: parentDetail
                    ? {
                        father: parentDetail.father
                            ? {
                                name: parentDetail.father.name,
                                phoneNumber:
                                    parentDetail.father.phoneNumber,
                                email: parentDetail.father.email,
                                occupation:
                                    parentDetail.father.occupation,
                            }
                            : undefined,
                        mother: parentDetail.mother
                            ? {
                                name: parentDetail.mother.name,
                                phoneNumber:
                                    parentDetail.mother.phoneNumber,
                                email: parentDetail.mother.email,
                                occupation:
                                    parentDetail.mother.occupation,
                            }
                            : undefined,
                        guardian: parentDetail.guardian
                            ? {
                                name: parentDetail.guardian.name,
                                relation:
                                    parentDetail.guardian.relation,
                                phoneNumber:
                                    parentDetail.guardian.phoneNumber,
                                email: parentDetail.guardian.email,
                                occupation:
                                    parentDetail.guardian.occupation,
                            }
                            : undefined,
                    }
                    : undefined
            };

            return studentData;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to fetch student');
        }
    }


    // Bulk Upload Students API Endpoint
    async bulkUploadStudentsAPI(bulkUploadData: BulkUploadStudentsRequest): Promise<BulkUploadSummary> {
        const successfulUploads: StudentUploadResult[] = [];
        const failedUploads: StudentUploadResult[] = [];
        let successCount = 0;
        let failedCount = 0;

        try {
            // Process each student
            for (let i = 0; i < bulkUploadData.students.length; i++) {
                const studentData = bulkUploadData.students[i];
                const rowNumber = i + 1;

                try {
                    // Validate batch, course, department, section exist
                    const batch = await this.batchRepositoryService.findById(studentData.batchId);
                    if (!batch) {
                        throw new Error('Batch not found');
                    }

                    const course = await this.courseRepositoryService.findById(studentData.courseId);
                    if (!course) {
                        throw new Error('Course not found');
                    }

                    const department = await this.departmentRepositoryService.findById(studentData.departmentId);
                    if (!department) {
                        throw new Error('Department not found');
                    }

                    const section = await this.sectionRepositoryService.findById(studentData.sectionId);
                    if (!section) {
                        throw new Error('Section not found');
                    }

                    // Check if personal email already exists
                    const existingContactByPersonalEmail = await this.studentContactInformationRepositoryService.findByPersonalEmail(studentData.personalEmail);
                    if (existingContactByPersonalEmail) {
                        throw new Error('Personal email already exists');
                    }

                    // Check if phone number already exists
                    const existingContactByPhone = await this.studentContactInformationRepositoryService.findByPhoneNumber(studentData.phoneNumber);
                    if (existingContactByPhone) {
                        throw new Error('Phone number already exists');
                    }

                    // Generate student email
                    const studentEmail = await this.generateStudentEmail(studentData.firstName, studentData.lastName);

                    // Check if generated student email already exists
                    const existingStudentEmail = await this.studentContactInformationRepositoryService.findByStudentEmail(studentEmail);
                    if (existingStudentEmail) {
                        throw new Error('Student email already exists');
                    }

                    // Generate student ID
                    const studentId = ulid();

                    // Check if student ID already exists
                    const existingStudentId = await this.studentRepositoryService.findByStudentId(studentId);
                    if (existingStudentId) {
                        throw new Error('Student ID already exists, please try again');
                    }

                    // Generate roll number
                    const rollNumber = await this.generateRollNumber(
                        new Types.ObjectId(studentData.batchId),
                        new Types.ObjectId(studentData.departmentId)
                    );

                    // Check if roll number already exists
                    const existingRollNumber = await this.studentAcademicDetailRepositoryService.findByRollNumber(rollNumber);
                    if (existingRollNumber) {
                        throw new Error('Roll number already exists');
                    }

                    // Start transaction for this student
                    const session = await this.userRepositoryService.startSession();
                    session.startTransaction();

                    try {
                        // Create User
                        const hashedPassword = await this.passwordService.hashPassword(studentData.dateOfBirth.toString());
                        const user = await this.userRepositoryService.create({
                            email: studentEmail,
                            password: hashedPassword,
                            role: UserRole.STUDENT,
                            isActive: true,
                            isEmailVerified: false,
                            isFirstLogin: true,
                            isPasswordReset: false
                        }, session);

                        // Create Personal Details
                        const personalDetail = await this.studentPersonalDetailRepositoryService.create({
                            firstName: studentData.firstName,
                            lastName: studentData.lastName,
                            gender: studentData.gender,
                            dateOfBirth: studentData.dateOfBirth,
                            profilePhotoUrl: studentData.profilePhotoUrl,
                            nationality: Nationality.INDIAN,
                            religion: studentData.religion
                        }, session);

                        // Create Contact Information
                        const contactInformation = await this.studentContactInformationRepositoryService.create({
                            personalEmail: studentData.personalEmail,
                            studentEmail: studentEmail,
                            phoneNumber: studentData.phoneNumber,
                            alternatePhoneNumber: studentData.alternatePhoneNumber,
                            emergencyContact: studentData.emergencyContact
                        }, session);

                        // Create Address Details
                        const addressDetail = await this.studentAddressDetailRepositoryService.create({
                            currentAddress: studentData.currentAddress,
                            sameAsCurrent: studentData.sameAsCurrent,
                            permanentAddress: studentData.sameAsCurrent ? studentData.currentAddress : studentData.permanentAddress
                        }, session);

                        // Create Academic Details
                        const academicDetail = await this.studentAcademicDetailRepositoryService.create({
                            rollNumber: rollNumber,
                            batchId: new Types.ObjectId(studentData.batchId),
                            courseId: new Types.ObjectId(studentData.courseId),
                            departmentId: new Types.ObjectId(studentData.departmentId),
                            sectionId: new Types.ObjectId(studentData.sectionId),
                            currentSemester: studentData.currentSemester,
                            admissionType: studentData.admissionType,
                            status: StudentStatus.ACTIVE
                        }, session);

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

                        // Create Education History
                        if (studentData.educationHistory && studentData.educationHistory.length > 0) {
                            const educationHistoryPromises = studentData.educationHistory.map(edu =>
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
                            await Promise.all(educationHistoryPromises);
                        }

                        // Create Parent Details if provided
                        if (studentData.father || studentData.mother || studentData.guardian) {
                            const parentDetail = await this.studentParentDetailRepositoryService.create({
                                studentId: student._id as Types.ObjectId,
                                father: studentData.father,
                                mother: studentData.mother,
                                guardian: studentData.guardian
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
                        session.endSession();

                        // Add to successful uploads
                        successfulUploads.push({
                            rowNumber: rowNumber,
                            studentId: studentId,
                            studentEmail: studentEmail,
                            status: 'success'
                        });
                        successCount++;

                    } catch (error) {
                        await session.abortTransaction();
                        session.endSession();
                        throw error;
                    }

                } catch (error) {
                    // Add to failed uploads
                    failedUploads.push({
                        rowNumber: rowNumber,
                        status: 'failed',
                        error: error.message || 'Unknown error occurred'
                    });
                    failedCount++;
                }
            }

            // Return summary
            const summary: BulkUploadSummary = {
                totalRecords: bulkUploadData.students.length,
                successCount: successCount,
                failedCount: failedCount,
                successfulUploads: successfulUploads,
                failedUploads: failedUploads
            };

            return summary;

        } catch (error) {
            throw new InternalServerErrorException('Failed to process bulk upload');
        }
    }

}