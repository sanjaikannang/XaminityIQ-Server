import { Types } from 'mongoose';
import { AttemptStatus, ChatRecipientType, ChatSenderRole, ExamStatus, FacultyDesignation, QuestionType, RoomAssignmentStatus, SubmissionTrigger } from 'src/utils/enum';
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

// Response
import { FacultyProfileData } from 'src/api/user/faculty/profile/get-my-profile/get-my-profile.response';
import { UpdateMyFacultyProfileRequest } from 'src/api/user/faculty/profile/update-my-profile/update-my-profile.request';

// Repositories
import { FacultyRepositoryService } from 'src/repositories/faculty-repository/faculty.repository';
import { FacultyPersonalDetailRepositoryService } from 'src/repositories/faculty-personal-detail-repository/faculty-personal-detail.repository';
import { FacultyContactInformationRepositoryService } from 'src/repositories/faculty-contact-information-repository/faculty-contact-information.repository';
import { FacultyAddressRepositoryService } from 'src/repositories/faculty-address-repository/faculty-address.repository';
import { FacultyEducationHistoryRepositoryService } from 'src/repositories/faculty-education-history-repository/faculty-education-history.repository';
import { FacultyWorkExperienceRepositoryService } from 'src/repositories/faculty-work-experience-repository/faculty-work-experience.repository';
import { FacultyEmploymentDetailRepositoryService } from 'src/repositories/faculty-employment-detail-repository/faculty-employment-detail.repository';
import { DepartmentRepositoryService } from 'src/repositories/department-repository/department.repository';
import { CourseRepositoryService } from 'src/repositories/course-repository/course.repository';
import { SubjectRepositoryService } from 'src/repositories/subject-repository/subject.repository';
import { StudentRepositoryService } from 'src/repositories/student-repository/student.repository';
import { StudentPersonalDetailRepositoryService } from 'src/repositories/student-personal-detail-repository/student-personal-detail.repository';
import { StudentContactInformationRepositoryService } from 'src/repositories/student-contact-information-repository/student-contact-information.repository';
import { ExamRepositoryService } from 'src/repositories/exam-repository/exam.repository';
import { ExamRoomRepositoryService } from 'src/repositories/exam-room-repository/exam-room.repository';
import { ExamRoomAssignmentRepositoryService } from 'src/repositories/exam-room-assignment-repository/exam-room-assignment.repository';
import { ExamRoomChatMessageRepositoryService } from 'src/repositories/exam-room-chat-message-repository/exam-room-chat-message.repository';
import { ExamQuestionRepositoryService } from 'src/repositories/exam-question-repository/exam-question.repository';
import { ExamAttemptRepositoryService } from 'src/repositories/exam-attempt-repository/exam-attempt.repository';
import { ExamAnswerRepositoryService } from 'src/repositories/exam-answer-repository/exam-answer.repository';

// Services
import { ExamAttemptService } from 'src/services/user-service/student/exam-attempt.service';
import { LiveKitService } from 'src/livekit/livekit.service';
import { ConfigService } from 'src/config/config.service';

const SUBJECT_LIMIT_PER_SEMESTER = 6;

@Injectable()
export class FacultyService {
    constructor(
        private readonly facultyRepositoryService: FacultyRepositoryService,
        private readonly facultyPersonalDetailRepositoryService: FacultyPersonalDetailRepositoryService,
        private readonly facultyContactInformationRepositoryService: FacultyContactInformationRepositoryService,
        private readonly facultyAddressRepositoryService: FacultyAddressRepositoryService,
        private readonly facultyEducationHistoryRepositoryService: FacultyEducationHistoryRepositoryService,
        private readonly facultyWorkExperienceRepositoryService: FacultyWorkExperienceRepositoryService,
        private readonly facultyEmploymentDetailRepositoryService: FacultyEmploymentDetailRepositoryService,
        private readonly departmentRepositoryService: DepartmentRepositoryService,
        private readonly courseRepositoryService: CourseRepositoryService,
        private readonly subjectRepositoryService: SubjectRepositoryService,
        private readonly studentRepositoryService: StudentRepositoryService,
        private readonly studentPersonalDetailRepositoryService: StudentPersonalDetailRepositoryService,
        private readonly studentContactInformationRepositoryService: StudentContactInformationRepositoryService,
        private readonly examRepositoryService: ExamRepositoryService,
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly examRoomAssignmentRepositoryService: ExamRoomAssignmentRepositoryService,
        private readonly examRoomChatMessageRepositoryService: ExamRoomChatMessageRepositoryService,
        private readonly examQuestionRepositoryService: ExamQuestionRepositoryService,
        private readonly examAttemptRepositoryService: ExamAttemptRepositoryService,
        private readonly examAnswerRepositoryService: ExamAnswerRepositoryService,
        private readonly examAttemptService: ExamAttemptService,
        private readonly liveKitService: LiveKitService,
        private readonly configService: ConfigService,
    ) { }


    // Resolve the authenticated user's Faculty document — no HOD/designation
    // check, since proctoring is available to any assigned faculty
    private async resolveFaculty(userId: string): Promise<Types.ObjectId> {
        const faculty = await this.facultyRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!faculty) {
            throw new NotFoundException('Faculty profile not found');
        }
        return faculty._id as Types.ObjectId;
    }


    // Get My Profile API Endpoint — the authenticated faculty's own full
    // profile, resolved from the JWT rather than an admin-supplied id
    async getMyProfileAPI(userId: string): Promise<FacultyProfileData> {
        const faculty = await this.facultyRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!faculty) {
            throw new NotFoundException('Faculty profile not found');
        }

        const personalDetail = await this.facultyPersonalDetailRepositoryService.findById(faculty.personalDetailId);
        if (!personalDetail) {
            throw new NotFoundException('Personal details not found');
        }

        const contactInfo = await this.facultyContactInformationRepositoryService.findById(faculty.contactInformationId);
        if (!contactInfo) {
            throw new NotFoundException('Contact information not found');
        }

        const addressDetail = await this.facultyAddressRepositoryService.findById(faculty.addressDetailId);
        if (!addressDetail) {
            throw new NotFoundException('Address details not found');
        }

        const employmentDetail = await this.facultyEmploymentDetailRepositoryService.findById(faculty.employmentDetailId);
        if (!employmentDetail) {
            throw new NotFoundException('Employment details not found');
        }

        const department = await this.departmentRepositoryService.findById(employmentDetail.departmentId.toString());
        if (!department) {
            throw new NotFoundException('Department not found');
        }

        const educationHistory = await this.facultyEducationHistoryRepositoryService.findByFacultyId(faculty._id as Types.ObjectId);
        const workExperience = await this.facultyWorkExperienceRepositoryService.findByFacultyId(faculty._id as Types.ObjectId);
        const departmentSubjects = await this.subjectRepositoryService.findByDepartment(
            employmentDetail.departmentId, {}, 0, 100,
        );

        return {
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
            employmentDetails: {
                employeeId: employmentDetail.employeeId,
                designation: employmentDetail.designation,
                departmentName: department.deptName,
                employmentType: employmentDetail.employmentType,
                dateOfJoining: employmentDetail.dateOfJoining,
                dateOfLeaving: employmentDetail.dateOfLeaving,
                totalExperienceYears: employmentDetail.totalExperienceYears,
                highestQualification: employmentDetail.highestQualification,
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
            departmentSubjects: departmentSubjects.map((subject) => ({
                _id: (subject._id as Types.ObjectId).toString(),
                subjectCode: subject.subjectCode,
                subjectName: subject.subjectName,
                semester: subject.semester,
                credits: subject.credits,
                subjectType: subject.subjectType,
                description: subject.description,
                createdAt: (subject as any).createdAt,
            })),
            isActive: faculty.isActive,
            profileCompletionPercentage: this.computeProfileCompletion(personalDetail, contactInfo, addressDetail, employmentDetail, educationHistory, workExperience),
        };
    }


    // Weighted equally across the fields that moved from mandatory-at-creation
    // to self-serve (see the schema/DTO comments on each).
    private computeProfileCompletion(personalDetail: any, contactInfo: any, addressDetail: any, employmentDetail: any, educationHistory: any[], workExperience: any[]): number {
        const checks = [
            !!personalDetail.profilePhotoUrl,
            !!personalDetail.maritalStatus,
            !!contactInfo.emergencyContact,
            !!addressDetail.currentAddress,
            !!employmentDetail.highestQualification,
            educationHistory.length > 0,
            workExperience.length > 0,
        ];
        const filled = checks.filter(Boolean).length;
        return Math.round((filled / checks.length) * 100);
    }


    // Update My Profile API Endpoint — self-serve completion of everything
    // that's optional at admin-creation time (see create-faculty.request.ts).
    // Each section only touches what's provided; omitted sections are left as-is.
    async updateMyProfileAPI(userId: string, data: UpdateMyFacultyProfileRequest): Promise<{ message: string }> {
        const faculty = await this.facultyRepositoryService.findByUserId(new Types.ObjectId(userId));
        if (!faculty) {
            throw new NotFoundException('Faculty profile not found');
        }

        if (data.profilePhotoUrl !== undefined || data.maritalStatus !== undefined) {
            const personalUpdate: any = {};
            if (data.profilePhotoUrl !== undefined) personalUpdate.profilePhotoUrl = data.profilePhotoUrl;
            if (data.maritalStatus !== undefined) personalUpdate.maritalStatus = data.maritalStatus;
            await this.facultyPersonalDetailRepositoryService.updateById(faculty.personalDetailId, personalUpdate);
        }

        if (data.emergencyContact !== undefined || data.alternatePhoneNumber !== undefined) {
            const contactUpdate: any = {};
            if (data.emergencyContact !== undefined) contactUpdate.emergencyContact = data.emergencyContact;
            if (data.alternatePhoneNumber !== undefined) contactUpdate.alternatePhoneNumber = data.alternatePhoneNumber;
            await this.facultyContactInformationRepositoryService.updateById(faculty.contactInformationId, contactUpdate);
        }

        if (data.currentAddress !== undefined || data.permanentAddress !== undefined || data.sameAsCurrent !== undefined) {
            const addressUpdate: any = {};
            if (data.currentAddress !== undefined) addressUpdate.currentAddress = data.currentAddress;
            if (data.sameAsCurrent !== undefined) addressUpdate.sameAsCurrent = data.sameAsCurrent;
            if (data.permanentAddress !== undefined || data.sameAsCurrent) {
                addressUpdate.permanentAddress = data.sameAsCurrent ? (data.currentAddress ?? addressUpdate.currentAddress) : data.permanentAddress;
            }
            await this.facultyAddressRepositoryService.updateById(faculty.addressDetailId, addressUpdate);
        }

        if (data.totalExperienceYears !== undefined || data.highestQualification !== undefined) {
            const employmentUpdate: any = {};
            if (data.totalExperienceYears !== undefined) employmentUpdate.totalExperienceYears = data.totalExperienceYears;
            if (data.highestQualification !== undefined) employmentUpdate.highestQualification = data.highestQualification;
            await this.facultyEmploymentDetailRepositoryService.updateById(faculty.employmentDetailId, employmentUpdate);
        }

        if (data.educationHistory && data.educationHistory.length > 0) {
            await this.facultyEducationHistoryRepositoryService.deleteByFacultyId(faculty._id as Types.ObjectId);
            const educationHistoryDocs = await Promise.all(
                data.educationHistory.map((edu) =>
                    this.facultyEducationHistoryRepositoryService.create({
                        facultyId: faculty._id as Types.ObjectId,
                        level: edu.level,
                        qualification: edu.qualification,
                        boardOrUniversity: edu.boardOrUniversity,
                        institutionName: edu.institutionName,
                        yearOfPassing: edu.yearOfPassing,
                        percentageOrCGPA: edu.percentageOrCGPA,
                        specialization: edu.specialization,
                    } as any),
                ),
            );
            await this.facultyRepositoryService.updateById(faculty._id as Types.ObjectId, {
                educationHistoryIds: educationHistoryDocs.map((doc) => doc._id as Types.ObjectId),
            });
        }

        if (data.workExperience && data.workExperience.length > 0) {
            const workExperienceDocs = await Promise.all(
                data.workExperience.map((work) =>
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
                        isCurrent: work.isCurrent || false,
                    } as any),
                ),
            );
            await this.facultyRepositoryService.updateById(faculty._id as Types.ObjectId, {
                workExperienceIds: workExperienceDocs.map((doc) => doc._id as Types.ObjectId),
            });
        }

        return { message: 'Profile updated successfully' };
    }


    // Ownership-check helper — confirms the room belongs to this faculty
    private async ownRoomOrThrow(facultyId: Types.ObjectId, roomId: string) {
        const room = await this.examRoomRepositoryService.findById(roomId);
        if (!room || room.facultyId.toString() !== facultyId.toString()) {
            throw new NotFoundException('Room not found');
        }
        return room;
    }


    private mapChatMessage(message: any) {
        return {
            _id: message._id.toString(),
            senderRole: message.senderRole,
            senderId: message.senderId.toString(),
            recipientType: message.recipientType,
            recipientStudentId: message.recipientStudentId ? message.recipientStudentId.toString() : undefined,
            message: message.message,
            sentAt: message.sentAt,
        };
    }


    // Get My Exam Rooms API Endpoint — rooms this faculty invigilates
    async getMyExamRoomsAPI(userId: string) {
        const facultyId = await this.resolveFaculty(userId);
        const rooms = await this.examRoomRepositoryService.findByFacultyId(facultyId);

        const results: any[] = [];
        for (const room of rooms) {
            const assignments = await this.examRoomAssignmentRepositoryService.findByRoomId(room._id as Types.ObjectId);
            const exams = await this.resolveExamNamesForAssignments(assignments);
            results.push({
                roomId: (room._id as Types.ObjectId).toString(),
                exams,
                startDateTime: room.startDateTime,
                endDateTime: room.endDateTime,
                status: room.status,
                studentCount: assignments.length,
            });
        }
        return results;
    }


    // Resolves {examId, examName} for every distinct exam represented across a
    // room's assignments — a pooled room mixes leftover students from multiple
    // window-sibling exams, so exam identity must be read per-assignment, not
    // assumed to be a single room-wide value (Dynamic Room Allocation)
    private async resolveExamNamesForAssignments(
        assignments: { examId: Types.ObjectId }[],
    ): Promise<{ examId: string; examName: string }[]> {
        const distinctExamIds = [...new Set(assignments.map((a) => a.examId.toString()))];
        const exams = await Promise.all(distinctExamIds.map((id) => this.examRepositoryService.findByIdRaw(id)));
        return distinctExamIds.map((id, index) => ({ examId: id, examName: exams[index]?.name || '' }));
    }


    // Get LiveKit Token API Endpoint (faculty) — full grants, since the invigilator
    // both views every admitted student's tracks and may publish their own camera/mic
    async getLiveKitTokenAPI(userId: string, roomId: string) {
        const facultyId = await this.resolveFaculty(userId);
        const room = await this.ownRoomOrThrow(facultyId, roomId);

        const identity = `faculty-${facultyId.toString()}`;
        const token = await this.liveKitService.generateToken(
            room.liveKitSessionId,
            identity,
            identity,
            { canPublish: true, canSubscribe: true, canPublishData: true },
        );

        return {
            token,
            liveKitUrl: this.configService.getLiveKitUrl(),
            roomName: room.liveKitSessionId,
            identity,
        };
    }


    // Get Exam Room Detail API Endpoint (ownership-checked) — full waiting queue + admitted list
    async getExamRoomDetailAPI(userId: string, roomId: string) {
        const facultyId = await this.resolveFaculty(userId);
        const room = await this.ownRoomOrThrow(facultyId, roomId);

        const assignments = await this.examRoomAssignmentRepositoryService.findByRoomId(roomId);
        const exams = await this.resolveExamNamesForAssignments(assignments);
        const examNameById = new Map(exams.map((e) => [e.examId, e.examName]));
        const students = await this.studentRepositoryService.findByIdsPreserveOrder(assignments.map((a) => a.studentId));
        const studentCodeById = new Map(students.map((s) => [(s._id as Types.ObjectId).toString(), s.studentId]));
        const studentDetailById = await this.resolveStudentDetails(students);

        return {
            roomId,
            exams,
            startDateTime: room.startDateTime,
            endDateTime: room.endDateTime,
            status: room.status,
            liveKitSessionId: room.liveKitSessionId,
            assignments: assignments.map((a) => {
                const studentIdStr = a.studentId.toString();
                const detail = studentDetailById.get(studentIdStr);
                return {
                    assignmentId: (a._id as Types.ObjectId).toString(),
                    examId: a.examId.toString(),
                    examName: examNameById.get(a.examId.toString()) || '',
                    studentId: studentIdStr,
                    studentCode: studentCodeById.get(studentIdStr) || '',
                    studentName: detail?.name || '',
                    studentEmail: detail?.email || '',
                    attemptId: a.attemptId ? a.attemptId.toString() : null,
                    status: a.status,
                    enteredWaitingRoomAt: a.enteredWaitingRoomAt,
                    admittedAt: a.admittedAt,
                    removedAt: a.removedAt,
                    removalReason: a.removalReason,
                };
            }),
        };
    }


    // Resolves {name, email} for a batch of student documents, keyed by
    // student _id — batches the personal-detail/contact-info lookups instead
    // of one query per student
    private async resolveStudentDetails(
        students: { _id: any; personalDetailId: Types.ObjectId; contactInformationId: Types.ObjectId }[],
    ): Promise<Map<string, { name: string; email: string }>> {
        const personalDetails = await this.studentPersonalDetailRepositoryService.findByIds(
            students.map((s) => s.personalDetailId),
        );
        const contactInfos = await this.studentContactInformationRepositoryService.findByIds(
            students.map((s) => s.contactInformationId),
        );
        const personalById = new Map(personalDetails.map((p) => [(p._id as Types.ObjectId).toString(), p]));
        const contactById = new Map(contactInfos.map((c) => [(c._id as Types.ObjectId).toString(), c]));

        return new Map(students.map((s) => {
            const personal = personalById.get(s.personalDetailId.toString());
            const contact = contactById.get(s.contactInformationId.toString());
            return [
                (s._id as Types.ObjectId).toString(),
                {
                    name: personal ? `${personal.firstName} ${personal.lastName}` : '',
                    email: contact?.studentEmail || '',
                },
            ];
        }));
    }


    // Admit Student API Endpoint — creates the attempt at admission time and connects it to this room
    async admitStudentAPI(userId: string, roomId: string, assignmentId: string) {
        const facultyId = await this.resolveFaculty(userId);
        await this.ownRoomOrThrow(facultyId, roomId);

        const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndId(roomId, assignmentId);
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }
        if (assignment.status !== RoomAssignmentStatus.WAITING) {
            throw new ConflictException('Only a WAITING student can be admitted');
        }

        const attempt = await this.examAttemptService.createAttemptOnAdmission(
            assignment.examId.toString(),
            assignment.studentId.toString(),
            assignment.roomId as Types.ObjectId,
        );

        await this.examRoomAssignmentRepositoryService.updateById(assignmentId, {
            status: RoomAssignmentStatus.ADMITTED,
            attemptId: attempt._id as Types.ObjectId,
            admittedAt: new Date(),
            admittedBy: facultyId,
        });

        return { message: 'Student admitted', attemptId: (attempt._id as Types.ObjectId).toString() };
    }


    // Reject Student API Endpoint — turns away a waiting student before admission
    async rejectStudentAPI(userId: string, roomId: string, assignmentId: string, reason: string) {
        const facultyId = await this.resolveFaculty(userId);
        await this.ownRoomOrThrow(facultyId, roomId);

        const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndId(roomId, assignmentId);
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }
        if (assignment.status !== RoomAssignmentStatus.WAITING) {
            throw new ConflictException('Only a WAITING student can be rejected');
        }

        await this.examRoomAssignmentRepositoryService.updateById(assignmentId, {
            status: RoomAssignmentStatus.REJECTED,
            removedAt: new Date(),
            removedBy: facultyId,
            removalReason: reason,
        });

        return { message: 'Student rejected' };
    }


    // Remove Student API Endpoint — forces disconnection of an admitted student and
    // finalizes their attempt through the same path as a manual submit
    async removeStudentAPI(userId: string, roomId: string, assignmentId: string, reason?: string) {
        const facultyId = await this.resolveFaculty(userId);
        const room = await this.ownRoomOrThrow(facultyId, roomId);

        const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndId(roomId, assignmentId);
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }
        if (!assignment.attemptId) {
            throw new ConflictException('This student has not been admitted yet');
        }

        await this.examAttemptService.finalizeAttemptByFaculty(assignment.attemptId.toString(), SubmissionTrigger.FACULTY_REMOVED);

        await this.examRoomAssignmentRepositoryService.updateById(assignmentId, {
            status: RoomAssignmentStatus.REMOVED,
            removedAt: new Date(),
            removedBy: facultyId,
            removalReason: reason,
        });

        try {
            await this.liveKitService.removeParticipant(room.liveKitSessionId, `student-${assignment.studentId.toString()}`);
        } catch {
            // Best-effort — the student may already be disconnected or LiveKit may not be configured yet
        }

        return { message: 'Student removed' };
    }


    // Mute/Unmute Student Mic API Endpoint — server-side forced mute of the
    // student's own published mic track via LiveKit; returns null muted state
    // if the student hasn't published a mic track yet (e.g. no mic permission)
    async setStudentMicMutedAPI(userId: string, roomId: string, assignmentId: string, muted: boolean) {
        const facultyId = await this.resolveFaculty(userId);
        const room = await this.ownRoomOrThrow(facultyId, roomId);

        const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndId(roomId, assignmentId);
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }

        const identity = `student-${assignment.studentId.toString()}`;
        const result = await this.liveKitService.setParticipantMicMuted(room.liveKitSessionId, identity, muted);

        return {
            message: result === null ? 'Student has no active mic track to mute' : (muted ? 'Student mic muted' : 'Student mic unmuted'),
            muted: result,
        };
    }


    // Send Chat API Endpoint (faculty) — can target one student (INDIVIDUAL) or the whole room (BROADCAST_ROOM)
    async sendChatAPI(
        userId: string,
        roomId: string,
        message: string,
        recipientType: ChatRecipientType,
        recipientStudentId?: string,
    ) {
        const facultyId = await this.resolveFaculty(userId);
        await this.ownRoomOrThrow(facultyId, roomId);

        if (recipientType === ChatRecipientType.INDIVIDUAL) {
            if (!recipientStudentId) {
                throw new BadRequestException('recipientStudentId is required for an INDIVIDUAL message');
            }
            const assignment = await this.examRoomAssignmentRepositoryService.findByRoomAndStudent(roomId, recipientStudentId);
            if (!assignment) {
                throw new NotFoundException('Student is not assigned to this room');
            }
        } else if (recipientType !== ChatRecipientType.BROADCAST_ROOM) {
            throw new BadRequestException('Faculty can only send INDIVIDUAL or BROADCAST_ROOM messages');
        }

        const chatMessage = await this.examRoomChatMessageRepositoryService.create({
            roomId: new Types.ObjectId(roomId),
            senderRole: ChatSenderRole.FACULTY,
            senderId: new Types.ObjectId(userId),
            recipientType,
            recipientStudentId: recipientStudentId ? new Types.ObjectId(recipientStudentId) : undefined,
            message,
            sentAt: new Date(),
        } as any);

        return this.mapChatMessage(chatMessage);
    }


    // Get Chat History API Endpoint (faculty) — sees every message in the room, no filtering needed
    async getChatHistoryAPI(userId: string, roomId: string) {
        const facultyId = await this.resolveFaculty(userId);
        await this.ownRoomOrThrow(facultyId, roomId);

        const messages = await this.examRoomChatMessageRepositoryService.findByRoomId(roomId);
        return messages.map((m) => this.mapChatMessage(m));
    }


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


    // Ownership + timing check for evaluation — must be an assigned evaluator, and the
    // exam must be COMPLETED (viewing also allows RESULTS_PUBLISHED, read-only history)
    private assertCanEvaluate(facultyId: Types.ObjectId, exam: any, requireGradeable: boolean) {
        const isEvaluator = (exam.evaluatorFacultyIds || []).some((id: any) => id.toString() === facultyId.toString());
        if (!isEvaluator) {
            throw new ForbiddenException('You are not an assigned evaluator for this exam');
        }

        if (requireGradeable) {
            if (exam.status !== ExamStatus.COMPLETED) {
                throw new ForbiddenException('This exam is not open for grading — it is either not yet completed or its results have already been published');
            }
        } else if (exam.status !== ExamStatus.COMPLETED && exam.status !== ExamStatus.RESULTS_PUBLISHED) {
            throw new ForbiddenException('This exam is not available for evaluation');
        }
    }


    // Get My Evaluation Exams API Endpoint — exams this faculty is an assigned evaluator for
    async getMyEvaluationExamsAPI(userId: string) {
        const facultyId = await this.resolveFaculty(userId);
        const exams = await this.examRepositoryService.findByEvaluatorFacultyId(
            facultyId.toString(),
            [ExamStatus.COMPLETED, ExamStatus.RESULTS_PUBLISHED],
        );

        return exams.map((exam) => ({
            examId: (exam._id as Types.ObjectId).toString(),
            name: exam.name,
            status: exam.status,
            totalMarks: exam.totalMarks,
        }));
    }


    // Get Exam Answers For Evaluation API Endpoint — every WRITTEN/TYPING
    // (hand-graded) answer across every terminal attempt for this exam,
    // forming the faculty's grading queue
    async getExamAnswersForEvaluationAPI(userId: string, examId: string) {
        const facultyId = await this.resolveFaculty(userId);
        const exam = await this.examRepositoryService.findByIdRaw(examId);
        if (!exam) throw new NotFoundException('Exam not found');
        this.assertCanEvaluate(facultyId, exam, false);

        const questions = await this.examQuestionRepositoryService.findByExamId(examId);
        const writtenQuestionById = new Map(
            questions
                .filter((q) => q.type === QuestionType.WRITTEN || q.type === QuestionType.TYPING)
                .map((q) => [(q._id as Types.ObjectId).toString(), q]),
        );

        const allAttempts = await this.examAttemptRepositoryService.findAllByExamId(examId);
        const terminalAttempts = allAttempts.filter(
            (a) => a.status === AttemptStatus.SUBMITTED || a.status === AttemptStatus.COMPLETED,
        );
        const attemptIds = terminalAttempts.map((a) => (a._id as Types.ObjectId).toString());
        const allAnswers = attemptIds.length > 0
            ? await this.examAnswerRepositoryService.findByAttemptIds(attemptIds)
            : [];

        const students = await this.studentRepositoryService.findByIdsPreserveOrder(
            terminalAttempts.map((a) => a.studentId),
        );
        const studentCodeById = new Map(students.map((s) => [(s._id as Types.ObjectId).toString(), s.studentId]));
        const studentIdByAttemptId = new Map(
            terminalAttempts.map((a) => [(a._id as Types.ObjectId).toString(), a.studentId.toString()]),
        );

        return allAnswers
            .filter((answer) => writtenQuestionById.has(answer.questionId.toString()))
            .map((answer) => {
                const question = writtenQuestionById.get(answer.questionId.toString())!;
                const studentId = studentIdByAttemptId.get(answer.attemptId.toString()) || '';
                return {
                    answerId: (answer._id as Types.ObjectId).toString(),
                    attemptId: answer.attemptId.toString(),
                    studentCode: studentCodeById.get(studentId) || '',
                    type: question.type,
                    questionText: question.text,
                    maxMarks: question.marks,
                    pages: answer.pages,
                    answerText: answer.answerText,
                    marksAwarded: answer.marksAwarded,
                    remarks: answer.remarks,
                    evaluatedAt: answer.evaluatedAt,
                };
            });
    }


    // Evaluate Answer API Endpoint — assigns marks + remarks to one WRITTEN answer
    async evaluateAnswerAPI(userId: string, answerId: string, marksAwarded: number, remarks?: string) {
        const facultyId = await this.resolveFaculty(userId);

        const answer = await this.examAnswerRepositoryService.findById(answerId);
        if (!answer) throw new NotFoundException('Answer not found');

        const attempt = await this.examAttemptRepositoryService.findById(answer.attemptId.toString());
        if (!attempt) throw new NotFoundException('Attempt not found');

        const exam = await this.examRepositoryService.findByIdRaw(attempt.examId.toString());
        if (!exam) throw new NotFoundException('Exam not found');

        this.assertCanEvaluate(facultyId, exam, true);

        const question = await this.examQuestionRepositoryService.findById(answer.questionId.toString());
        if (!question || (question.type !== QuestionType.WRITTEN && question.type !== QuestionType.TYPING)) {
            throw new BadRequestException('This answer is not for a WRITTEN or TYPING question');
        }

        if (marksAwarded < 0 || marksAwarded > question.marks) {
            throw new BadRequestException(`Marks must be between 0 and ${question.marks}`);
        }

        await this.examAnswerRepositoryService.updateById(answerId, {
            marksAwarded,
            evaluatedBy: new Types.ObjectId(userId),
            evaluatedAt: new Date(),
            remarks,
        } as any);

        return { message: 'Answer evaluated successfully' };
    }

}
