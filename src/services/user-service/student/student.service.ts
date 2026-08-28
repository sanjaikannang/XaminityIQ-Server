import { Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SubjectData } from 'src/api/user/faculty/subject-management/get-all-subjects/get-all-subjects.response';
import { StudentProfileData } from 'src/api/user/student/profile/get-my-profile/get-my-profile.response';
import { UpdateMyStudentProfileRequest } from 'src/api/user/student/profile/update-my-profile/update-my-profile.request';
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { StudentAcademicDetailRepositoryService } from 'src/repositories/student-academic-detail-repository/student-academic-detail.repository';
import { StudentPersonalDetailRepositoryService } from 'src/repositories/student-personal-detail-repository/student-personal-detail.repository';
import { StudentContactInformationRepositoryService } from 'src/repositories/student-contact-information-repository/student-contact-information.repository';
import { StudentAddressDetailRepositoryService } from 'src/repositories/student-address-detail-repository/student-address-detail.repository';
import { StudentEducationHistoryRepositoryService } from 'src/repositories/student-education-history-repository/student-education-history.repository';
import { StudentParentDetailRepositoryService } from 'src/repositories/student-parent-detail-repository/student-parent-detail.repository';
import { BatchRepositoryService } from 'src/repositories/batch-repository/batch.repository';
import { CourseRepositoryService } from 'src/repositories/course-repository/course.repository';
import { DepartmentRepositoryService } from 'src/repositories/department-repository/department.repository';
import { SectionRepositoryService } from 'src/repositories/section-repository/section.repository';
import { SubjectRepositoryService } from 'src/repositories/subject-repository/subject.repository';
import { StudentParentDetailDocument } from 'src/schemas/User/Student/studentParentDetail.schema';

@Injectable()
export class StudentService {
    constructor(
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly studentAcademicDetailRepositoryService: StudentAcademicDetailRepositoryService,
        private readonly studentPersonalDetailRepositoryService: StudentPersonalDetailRepositoryService,
        private readonly studentContactInformationRepositoryService: StudentContactInformationRepositoryService,
        private readonly studentAddressDetailRepositoryService: StudentAddressDetailRepositoryService,
        private readonly studentEducationHistoryRepositoryService: StudentEducationHistoryRepositoryService,
        private readonly studentParentDetailRepositoryService: StudentParentDetailRepositoryService,
        private readonly batchRepositoryService: BatchRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly departmentRepositoryService: DepartmentRepositoryService,
        private readonly sectionRepositoryService: SectionRepositoryService,
        private readonly subjectRepositoryService: SubjectRepositoryService,
    ) { }


    // Get My Subjects API Endpoint - fully derived from the authenticated student's
    // own batch/course/department/current semester, no client-supplied params
    async getMySubjectsAPI(userId: string): Promise<SubjectData[]> {
        const student = await this.studentRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!student) {
            throw new NotFoundException('Student profile not found');
        }

        const academicDetail = await this.studentAcademicDetailRepositoryService.findById(
            student.academicDetailId as Types.ObjectId,
        );
        if (!academicDetail) {
            throw new NotFoundException('Student academic details not found');
        }

        const subjects = await this.subjectRepositoryService.findByDepartmentAndSemester(
            academicDetail.departmentId,
            academicDetail.currentSemester,
        );

        return subjects.map((subject) => ({
            _id: (subject._id as Types.ObjectId).toString(),
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            semester: subject.semester,
            credits: subject.credits,
            subjectType: subject.subjectType,
            description: subject.description,
            createdAt: (subject as any).createdAt,
        }));
    }


    // Weighted equally across the fields that moved from mandatory-at-creation
    // to self-serve (see the schema/DTO comments on each) — 0 means none of
    // them have been filled in yet, 100 means all have.
    private computeProfileCompletion(personalDetail: any, contactInfo: any, addressDetail: any, educationHistory: any[], parentDetail: any): number {
        const checks = [
            !!personalDetail.profilePhotoUrl,
            !!contactInfo.emergencyContact,
            !!addressDetail.currentAddress,
            educationHistory.length > 0,
            !!(parentDetail && (parentDetail.father || parentDetail.mother || parentDetail.guardian)),
        ];
        const filled = checks.filter(Boolean).length;
        return Math.round((filled / checks.length) * 100);
    }


    // Get My Profile API Endpoint — the authenticated student's own full
    // profile, resolved from the JWT rather than an admin-supplied id
    async getMyProfileAPI(userId: string): Promise<StudentProfileData> {
        const student = await this.studentRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!student) {
            throw new NotFoundException('Student profile not found');
        }

        const personalDetail = await this.studentPersonalDetailRepositoryService.findById(student.personalDetailId);
        if (!personalDetail) {
            throw new NotFoundException('Student personal details not found');
        }

        const contactInfo = await this.studentContactInformationRepositoryService.findById(student.contactInformationId);
        if (!contactInfo) {
            throw new NotFoundException('Student contact details not found');
        }

        const addressDetail = await this.studentAddressDetailRepositoryService.findById(student.addressDetailId);
        if (!addressDetail) {
            throw new NotFoundException('Student address details not found');
        }

        const academicDetail = await this.studentAcademicDetailRepositoryService.findById(student.academicDetailId);
        if (!academicDetail) {
            throw new NotFoundException('Student academic details not found');
        }

        const educationHistory = await this.studentEducationHistoryRepositoryService.findByStudentId(student._id as Types.ObjectId);

        let parentDetail: StudentParentDetailDocument | null = null;
        if (student.parentDetailId) {
            parentDetail = await this.studentParentDetailRepositoryService.findByStudentId(student._id as Types.ObjectId);
        }

        const batch = await this.batchRepositoryService.findById(academicDetail.batchId.toString());
        if (!batch) throw new NotFoundException('Batch not found');

        const course = await this.courseRepositoryService.findById(academicDetail.courseId.toString());
        if (!course) throw new NotFoundException('Course not found');

        const department = await this.departmentRepositoryService.findById(academicDetail.departmentId.toString());
        if (!department) throw new NotFoundException('Department not found');

        const section = await this.sectionRepositoryService.findById(academicDetail.sectionId.toString());
        if (!section) throw new NotFoundException('Section not found');

        return {
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
                emergencyContact: contactInfo.emergencyContact
                    ? {
                        name: contactInfo.emergencyContact.name,
                        relation: contactInfo.emergencyContact.relation,
                        phoneNumber: contactInfo.emergencyContact.phoneNumber,
                    }
                    : undefined,
            },
            addressDetails: {
                currentAddress: addressDetail.currentAddress
                    ? {
                        addressLine1: addressDetail.currentAddress.addressLine1,
                        addressLine2: addressDetail.currentAddress.addressLine2,
                        city: addressDetail.currentAddress.city,
                        state: addressDetail.currentAddress.state,
                        pincode: addressDetail.currentAddress.pincode,
                        country: addressDetail.currentAddress.country,
                    }
                    : undefined,
                sameAsCurrent: addressDetail.sameAsCurrent,
                permanentAddress: addressDetail.permanentAddress
                    ? {
                        addressLine1: addressDetail.permanentAddress.addressLine1,
                        addressLine2: addressDetail.permanentAddress.addressLine2,
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
                            phoneNumber: parentDetail.father.phoneNumber,
                            email: parentDetail.father.email,
                            occupation: parentDetail.father.occupation,
                        }
                        : undefined,
                    mother: parentDetail.mother
                        ? {
                            name: parentDetail.mother.name,
                            phoneNumber: parentDetail.mother.phoneNumber,
                            email: parentDetail.mother.email,
                            occupation: parentDetail.mother.occupation,
                        }
                        : undefined,
                    guardian: parentDetail.guardian
                        ? {
                            name: parentDetail.guardian.name,
                            relation: parentDetail.guardian.relation,
                            phoneNumber: parentDetail.guardian.phoneNumber,
                            email: parentDetail.guardian.email,
                            occupation: parentDetail.guardian.occupation,
                        }
                        : undefined,
                }
                : undefined,
            profileCompletionPercentage: this.computeProfileCompletion(personalDetail, contactInfo, addressDetail, educationHistory, parentDetail),
        };
    }


    // Update My Profile API Endpoint — self-serve completion of everything
    // that's optional at admin-creation time (see create-student.request.ts).
    // Each section only touches what's provided; omitted sections are left
    // as-is rather than cleared.
    async updateMyProfileAPI(userId: string, data: UpdateMyStudentProfileRequest): Promise<{ message: string }> {
        const student = await this.studentRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!student) {
            throw new NotFoundException('Student profile not found');
        }

        if (data.profilePhotoUrl !== undefined) {
            await this.studentPersonalDetailRepositoryService.updateById(student.personalDetailId, {
                profilePhotoUrl: data.profilePhotoUrl,
            });
        }

        if (data.emergencyContact !== undefined || data.alternatePhoneNumber !== undefined) {
            const contactUpdate: any = {};
            if (data.emergencyContact !== undefined) contactUpdate.emergencyContact = data.emergencyContact;
            if (data.alternatePhoneNumber !== undefined) contactUpdate.alternatePhoneNumber = data.alternatePhoneNumber;
            await this.studentContactInformationRepositoryService.updateById(student.contactInformationId, contactUpdate);
        }

        if (data.currentAddress !== undefined || data.permanentAddress !== undefined || data.sameAsCurrent !== undefined) {
            const addressUpdate: any = {};
            if (data.currentAddress !== undefined) addressUpdate.currentAddress = data.currentAddress;
            if (data.sameAsCurrent !== undefined) addressUpdate.sameAsCurrent = data.sameAsCurrent;
            if (data.permanentAddress !== undefined || data.sameAsCurrent) {
                addressUpdate.permanentAddress = data.sameAsCurrent ? (data.currentAddress ?? addressUpdate.currentAddress) : data.permanentAddress;
            }
            await this.studentAddressDetailRepositoryService.updateById(student.addressDetailId, addressUpdate);
        }

        if (data.educationHistory && data.educationHistory.length > 0) {
            await this.studentEducationHistoryRepositoryService.deleteByStudentId(student._id as Types.ObjectId);
            await Promise.all(
                data.educationHistory.map((edu) =>
                    this.studentEducationHistoryRepositoryService.create({
                        studentId: student._id as Types.ObjectId,
                        level: edu.level,
                        qualification: edu.qualification,
                        boardOrUniversity: edu.boardOrUniversity,
                        institutionName: edu.institutionName,
                        yearOfPassing: edu.yearOfPassing,
                        percentageOrCGPA: edu.percentageOrCGPA,
                    } as any),
                ),
            );
        }

        if (data.father || data.mother || data.guardian) {
            if (student.parentDetailId) {
                await this.studentParentDetailRepositoryService.updateById(student.parentDetailId, {
                    father: data.father,
                    mother: data.mother,
                    guardian: data.guardian,
                });
            } else {
                const parentDetail = await this.studentParentDetailRepositoryService.create({
                    studentId: student._id as Types.ObjectId,
                    father: data.father,
                    mother: data.mother,
                    guardian: data.guardian,
                } as any);
                await this.studentRepositoryService.updateById(student._id as Types.ObjectId, {
                    parentDetailId: parentDetail._id as Types.ObjectId,
                });
            }
        }

        return { message: 'Profile updated successfully' };
    }

}
