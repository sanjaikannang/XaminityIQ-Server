import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { ulid } from "ulid";
import { Types } from "mongoose";
import { FacultyStatus, Nationality, UserRole } from "src/utils/enum";
import { PasswordService } from "src/services/auth-service/password.service";

// Requests
import { CreateFacultyRequest } from "src/api/user/admin/faculty-management/create-faculty/create-faculty.request";

// Response

// Repositories
import { DepartmentRepositoryService } from "src/repositories/department-repository/department.repository";
import { UserRepositoryService } from "src/repositories/user-repository/user.repository";
import { FacultyRepositoryService } from "src/repositories/faculty-repository/faculty.repository";
import { FacultyPersonalDetailRepositoryService } from "src/repositories/faculty-personal-detail-repository/faculty-personal-detail.repository";
import { FacultyContactInformationRepositoryService } from "src/repositories/faculty-contact-information-repository/faculty-contact-information.repository";
import { FacultyAddressRepositoryService } from "src/repositories/faculty-address-repository/faculty-address.repository";
import { FacultyEducationHistoryRepositoryService } from "src/repositories/faculty-education-history-repository/faculty-education-history.repository";
import { FacultyEmploymentDetailRepositoryService } from "src/repositories/faculty-employment-detail-repository/faculty-employment-detail.repository";
import { FacultyWorkExperienceRepositoryService } from "src/repositories/faculty-work-experience-repository/faculty-work-experience.repository";

@Injectable()
export class FacultyManagementService {
    constructor(
        private readonly departmentRepositoryService: DepartmentRepositoryService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly passwordService: PasswordService,
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly facultyPersonalDetailRepositoryService: FacultyPersonalDetailRepositoryService,
        private readonly facultyContactInformationRepositoryService: FacultyContactInformationRepositoryService,
        private readonly facultyAddressRepositoryService: FacultyAddressRepositoryService,
        private readonly facultyEducationHistoryRepositoryService: FacultyEducationHistoryRepositoryService,
        private readonly facultyEmploymentDetailRepositoryService: FacultyEmploymentDetailRepositoryService,
        private readonly facultyWorkExperienceRepositoryService: FacultyWorkExperienceRepositoryService,
    ) { }


    // Create Faculty API Endpoint
    async createFacultyAPI(createFacultyData: CreateFacultyRequest) {
        try {
            const session = await this.userRepositoryService.startSession();
            session.startTransaction();

            try {
                // Validate department exists
                const department = await this.departmentRepositoryService.findById(createFacultyData.departmentId);
                if (!department) {
                    throw new NotFoundException('Department not found');
                }

                // Check if personal email already exists
                const existingContactByPersonalEmail = await this.facultyContactInformationRepositoryService.findByPersonalEmail(createFacultyData.personalEmail);
                if (existingContactByPersonalEmail) {
                    throw new ConflictException('Personal email already exists');
                }

                // Check if phone number already exists
                const existingContactByPhone = await this.facultyContactInformationRepositoryService.findByPhoneNumber(createFacultyData.phoneNumber);
                if (existingContactByPhone) {
                    throw new ConflictException('Phone number already exists');
                }

                // Check if employee ID already exists
                const existingEmployeeId = await this.facultyEmploymentDetailRepositoryService.findByEmployeeId(createFacultyData.employeeId);
                if (existingEmployeeId) {
                    throw new ConflictException('Employee ID already exists');
                }

                // Generate faculty email
                const facultyEmail = await this.generateFacultyEmail(createFacultyData.firstName, createFacultyData.lastName);
                console.log("facultyEmail...", facultyEmail);

                // Check if generated faculty email already exists
                const existingFacultyEmail = await this.facultyContactInformationRepositoryService.findByFacultyEmail(facultyEmail);
                if (existingFacultyEmail) {
                    throw new ConflictException('Faculty email already exists');
                }

                // Generate faculty ID (ULID)
                const facultyId = ulid();
                console.log("facultyId...", facultyId);

                // Check if faculty ID already exists
                const existingFacultyId = await this.facultyRepositoryService.findByFacultyId(facultyId);
                if (existingFacultyId) {
                    throw new ConflictException('Faculty ID already exists, please try again');
                }

                // Create User
                const hashedPassword = await this.passwordService.hashPassword(createFacultyData.dateOfBirth.toString());
                const user = await this.userRepositoryService.create({
                    email: facultyEmail,
                    password: hashedPassword,
                    role: UserRole.FACULTY,
                    isActive: true,
                    isEmailVerified: false,
                    isFirstLogin: true,
                    isPasswordReset: false
                }, session);
                console.log("user...", user);

                // Create Personal Details
                const personalDetail = await this.facultyPersonalDetailRepositoryService.create({
                    firstName: createFacultyData.firstName,
                    lastName: createFacultyData.lastName,
                    gender: createFacultyData.gender,
                    dateOfBirth: createFacultyData.dateOfBirth,
                    maritalStatus: createFacultyData.maritalStatus,
                    profilePhotoUrl: createFacultyData.profilePhotoUrl,
                    nationality: Nationality.INDIAN,
                    religion: createFacultyData.religion
                }, session);
                console.log("personalDetail...", personalDetail);

                // Create Contact Information
                const contactInformation = await this.facultyContactInformationRepositoryService.create({
                    personalEmail: createFacultyData.personalEmail,
                    facultyEmail: facultyEmail,
                    phoneNumber: createFacultyData.phoneNumber,
                    alternatePhoneNumber: createFacultyData.alternatePhoneNumber,
                    emergencyContact: createFacultyData.emergencyContact
                }, session);
                console.log("contactInformation...", contactInformation);

                // Create Address Details
                const addressDetail = await this.facultyAddressRepositoryService.create({
                    currentAddress: createFacultyData.currentAddress,
                    sameAsCurrent: createFacultyData.sameAsCurrent,
                    permanentAddress: createFacultyData.sameAsCurrent ? createFacultyData.currentAddress : createFacultyData.permanentAddress
                }, session);
                console.log("addressDetail...", addressDetail);

                // Create Employment Details
                const employmentDetail = await this.facultyEmploymentDetailRepositoryService.create({
                    employeeId: createFacultyData.employeeId,
                    designation: createFacultyData.designation,
                    departmentId: new Types.ObjectId(createFacultyData.departmentId),
                    employmentType: createFacultyData.employmentType,
                    dateOfJoining: new Date,
                    totalExperienceYears: createFacultyData.totalExperienceYears,
                    highestQualification: createFacultyData.highestQualification,
                    status: FacultyStatus.ACTIVE,
                    remarks: createFacultyData.remarks
                }, session);
                console.log("employmentDetail...", employmentDetail);

                // Create Faculty
                const faculty = await this.facultyRepositoryService.create({
                    userId: user._id as Types.ObjectId,
                    facultyId: facultyId,
                    personalDetailId: personalDetail._id as Types.ObjectId,
                    contactInformationId: contactInformation._id as Types.ObjectId,
                    addressDetailId: addressDetail._id as Types.ObjectId,
                    employmentDetailId: employmentDetail._id as Types.ObjectId,
                    educationHistoryIds: [],
                    workExperienceIds: [],
                    isActive: true
                }, session);
                console.log("faculty...", faculty);

                // Create Education History
                if (createFacultyData.educationHistory && createFacultyData.educationHistory.length > 0) {
                    const educationHistoryDocs = await Promise.all(
                        createFacultyData.educationHistory.map(edu =>
                            this.facultyEducationHistoryRepositoryService.create({
                                facultyId: faculty._id as Types.ObjectId,
                                level: edu.level,
                                qualification: edu.qualification,
                                boardOrUniversity: edu.boardOrUniversity,
                                institutionName: edu.institutionName,
                                yearOfPassing: edu.yearOfPassing,
                                percentageOrCGPA: edu.percentageOrCGPA,
                                specialization: edu.specialization,
                            }, session)
                        )
                    );

                    // Update faculty with education history IDs
                    const educationHistoryIds = educationHistoryDocs.map(doc => doc._id as Types.ObjectId);
                    await this.facultyRepositoryService.updateById(
                        faculty._id as Types.ObjectId,
                        { educationHistoryIds },
                        session
                    );
                }

                // Create Work Experience if provided
                if (createFacultyData.workExperience && createFacultyData.workExperience.length > 0) {
                    const workExperienceDocs = await Promise.all(
                        createFacultyData.workExperience.map(work =>
                            this.facultyWorkExperienceRepositoryService.create({
                                facultyId: faculty._id as Types.ObjectId,
                                organization: work.organization,
                                role: work.role,
                                department: work.department,
                                fromDate: work.fromDate,
                                toDate: work.toDate,
                                experienceYears: work.experienceYears,
                                jobDescription: work.jobDescription,
                                reasonForLeaving: work.reasonForLeaving,
                                isCurrent: work.isCurrent || false
                            }, session)
                        )
                    );

                    // Update faculty with work experience IDs
                    const workExperienceIds = workExperienceDocs.map(doc => doc._id as Types.ObjectId);
                    await this.facultyRepositoryService.updateById(
                        faculty._id as Types.ObjectId,
                        { workExperienceIds },
                        session
                    );
                }

                await session.commitTransaction();

                return {
                    facultyId: facultyId,
                    facultyEmail: facultyEmail,
                    employeeId: createFacultyData.employeeId
                };

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
            throw new InternalServerErrorException('Failed to create faculty');
        }
    }

    // generating faculty email
    private async generateFacultyEmail(firstName: string, lastName: string): Promise<string> {
        const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@college.edu`;
        const existingContact = await this.facultyContactInformationRepositoryService.findByFacultyEmail(baseEmail);

        if (!existingContact) {
            return baseEmail;
        }

        let counter = 1;
        let newEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@college.edu`;

        while (await this.facultyContactInformationRepositoryService.findByFacultyEmail(newEmail)) {
            counter++;
            newEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@college.edu`;
        }

        return newEmail;
    }

}