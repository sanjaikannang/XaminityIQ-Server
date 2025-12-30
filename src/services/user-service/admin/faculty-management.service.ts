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
import { FacultyDetailData } from "src/api/user/admin/faculty-management/get-faculty/get-faculty.response";
import { GetAllFacultyRequest } from "src/api/user/admin/faculty-management/get-all-faculty/get-all-faculty.request";
import { FacultyData } from "src/api/user/admin/faculty-management/get-all-faculty/get-all-faculty.response";
import { PaginationMeta } from "src/api/user/admin/get-all-batches/get-all-batches.response";

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
                console.log("password...", createFacultyData.dateOfBirth.toString());
                console.log("hashedPassword", hashedPassword);
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


    // Generating Faculty Email
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


    // Get All Faculty API Endpoint
    async getAllFacultyAPI(
        query: GetAllFacultyRequest
    ): Promise<{ faculty: FacultyData[]; pagination: PaginationMeta }> {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const search = query.search || '';
            const skip = (page - 1) * limit;

            // Build search filter
            let searchFilter: any = {};
            if (search) {
                searchFilter = {
                    $or: [{ facultyId: { $regex: search, $options: 'i' } }],
                };
            }

            // Get total count
            const totalItems =
                await this.facultyRepositoryService.countFaculty(searchFilter);

            // Get faculty with pagination
            const facultyList =
                await this.facultyRepositoryService.findAllWithDetails(
                    searchFilter,
                    skip,
                    limit
                );

            // Transform data
            const facultyData: FacultyData[] = await Promise.all(
                facultyList.map(async (faculty) => {
                    // Fetch related documents
                    const personalDetail =
                        await this.facultyPersonalDetailRepositoryService.findById(
                            faculty.personalDetailId
                        );

                    if (!personalDetail) {
                        throw new NotFoundException(
                            `Personal details not found for faculty ${faculty.facultyId}`
                        );
                    }

                    const contactInfo =
                        await this.facultyContactInformationRepositoryService.findById(
                            faculty.contactInformationId
                        );

                    if (!contactInfo) {
                        throw new NotFoundException(
                            `Contact information not found for faculty ${faculty.facultyId}`
                        );
                    }

                    const employmentDetail =
                        await this.facultyEmploymentDetailRepositoryService.findById(
                            faculty.employmentDetailId
                        );

                    if (!employmentDetail) {
                        throw new NotFoundException(
                            `Employment details not found for faculty ${faculty.facultyId}`
                        );
                    }

                    const department =
                        await this.departmentRepositoryService.findById(
                            employmentDetail.departmentId.toString()
                        );

                    if (!department) {
                        throw new NotFoundException(
                            `Department not found for faculty ${faculty.facultyId}`
                        );
                    }

                    // Build response object
                    return {
                        id: faculty.id,
                        facultyId: faculty.facultyId,
                        personalDetails: {
                            firstName: personalDetail.firstName,
                            lastName: personalDetail.lastName,
                            gender: personalDetail.gender,
                            dateOfBirth: personalDetail.dateOfBirth,
                            profilePhotoUrl: personalDetail.profilePhotoUrl,
                        },
                        contactDetails: {
                            personalEmail: contactInfo.personalEmail,
                            facultyEmail: contactInfo.facultyEmail,
                            phoneNumber: contactInfo.phoneNumber,
                        },
                        employmentDetails: {
                            employeeId: employmentDetail.employeeId,
                            designation: employmentDetail.designation,
                            departmentName: department.deptName,
                            employmentType: employmentDetail.employmentType,
                            dateOfJoining: employmentDetail.dateOfJoining,
                            status: employmentDetail.status,
                        },
                        isActive: faculty.isActive,
                    };
                })
            );

            // Build pagination metadata
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
                faculty: facultyData,
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

            throw new InternalServerErrorException('Failed to fetch faculty');
        }
    }


    // Get Faculty By ID API Endpoint
    async getFacultyByIdAPI(id: string): Promise<FacultyDetailData> {
        try {
            // Find faculty
            const faculty = await this.facultyRepositoryService.findById(
                new Types.ObjectId(id)
            );

            if (!faculty) {
                throw new NotFoundException('Faculty not found');
            }

            // Get all related details
            const personalDetail =
                await this.facultyPersonalDetailRepositoryService.findById(
                    faculty.personalDetailId
                );
            if (!personalDetail) {
                throw new NotFoundException(
                    `Personal details not found for faculty ${faculty.facultyId}`
                );
            }

            const contactInfo =
                await this.facultyContactInformationRepositoryService.findById(
                    faculty.contactInformationId
                );
            if (!contactInfo) {
                throw new NotFoundException(
                    `Contact information not found for faculty ${faculty.facultyId}`
                );
            }

            const addressDetail =
                await this.facultyAddressRepositoryService.findById(
                    faculty.addressDetailId
                );
            if (!addressDetail) {
                throw new NotFoundException(
                    `Address details not found for faculty ${faculty.facultyId}`
                );
            }

            const employmentDetail =
                await this.facultyEmploymentDetailRepositoryService.findById(
                    faculty.employmentDetailId
                );
            if (!employmentDetail) {
                throw new NotFoundException(
                    `Employment details not found for faculty ${faculty.facultyId}`
                );
            }

            // Get department name
            const department =
                await this.departmentRepositoryService.findById(
                    employmentDetail.departmentId.toString()
                );
            if (!department) {
                throw new NotFoundException(
                    `Department not found for faculty ${faculty.facultyId}`
                );
            }

            // Get education history
            const educationHistory =
                await this.facultyEducationHistoryRepositoryService.findByFacultyId(
                    faculty._id as Types.ObjectId
                );

            // Get work experience
            const workExperience =
                await this.facultyWorkExperienceRepositoryService.findByFacultyId(
                    faculty._id as Types.ObjectId
                );

            // Transform data
            const facultyData: FacultyDetailData = {
                facultyId: faculty.facultyId,
                userId: faculty.userId.toString(),

                personalDetails: {
                    firstName: personalDetail.firstName,
                    lastName: personalDetail.lastName,
                    gender: personalDetail.gender,
                    dateOfBirth: personalDetail.dateOfBirth,
                    maritalStatus: personalDetail.maritalStatus,
                    profilePhotoUrl: personalDetail.profilePhotoUrl,
                    nationality: personalDetail.nationality,
                    religion: personalDetail.religion,
                },

                contactDetails: {
                    personalEmail: contactInfo.personalEmail,
                    facultyEmail: contactInfo.facultyEmail,
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

                employmentDetails: {
                    employeeId: employmentDetail.employeeId,
                    designation: employmentDetail.designation,
                    departmentName: department.deptName,
                    employmentType: employmentDetail.employmentType,
                    dateOfJoining: employmentDetail.dateOfJoining,
                    dateOfLeaving: employmentDetail.dateOfLeaving,
                    totalExperienceYears:
                        employmentDetail.totalExperienceYears,
                    highestQualification:
                        employmentDetail.highestQualification,
                    status: employmentDetail.status,
                    remarks: employmentDetail.remarks,
                },

                educationHistory: educationHistory.map((edu) => ({
                    level: edu.level,
                    qualification: edu.qualification,
                    boardOrUniversity: edu.boardOrUniversity,
                    institutionName: edu.institutionName,
                    yearOfPassing: edu.yearOfPassing,
                    percentageOrCGPA: edu.percentageOrCGPA,
                    specialization: edu.specialization,
                })),

                workExperience: workExperience.map((work) => ({
                    organization: work.organization,
                    role: work.role,
                    department: work.department,
                    fromDate: work.fromDate,
                    toDate: work.toDate,
                    experienceYears: work.experienceYears,
                    jobDescription: work.jobDescription,
                    reasonForLeaving: work.reasonForLeaving,
                    isCurrent: work.isCurrent,
                })),

                isActive: faculty.isActive,
            };

            return facultyData;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to fetch faculty');
        }
    }

}