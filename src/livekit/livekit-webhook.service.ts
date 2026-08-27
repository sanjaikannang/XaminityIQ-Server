import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { RoomAssignmentStatus } from 'src/utils/enum';
import { ExamRoomRepositoryService } from 'src/repositories/exam-room-repository/exam-room.repository';
import { ExamRoomAssignmentRepositoryService } from 'src/repositories/exam-room-assignment-repository/exam-room-assignment.repository';

const STUDENT_IDENTITY_PREFIX = 'student-';

@Injectable()
export class LiveKitWebhookService {
    constructor(
        private readonly examRoomRepositoryService: ExamRoomRepositoryService,
        private readonly examRoomAssignmentRepositoryService: ExamRoomAssignmentRepositoryService,
    ) { }

    private async resolveAssignment(roomName: string, identity: string) {
        if (!identity.startsWith(STUDENT_IDENTITY_PREFIX)) return null;
        const studentId = identity.slice(STUDENT_IDENTITY_PREFIX.length);
        if (!Types.ObjectId.isValid(studentId)) return null;

        const room = await this.examRoomRepositoryService.findByLiveKitSessionId(roomName);
        if (!room) return null;

        return this.examRoomAssignmentRepositoryService.findByRoomAndStudent((room._id as Types.ObjectId), studentId);
    }

    // Starts the grace-period clock — only for a student mid-exam
    // (ADMITTED/IN_PROGRESS); WAITING/terminal statuses aren't affected.
    async handleParticipantLeft(roomName: string, identity: string): Promise<void> {
        const assignment = await this.resolveAssignment(roomName, identity);
        if (!assignment) return;
        if (![RoomAssignmentStatus.ADMITTED, RoomAssignmentStatus.IN_PROGRESS].includes(assignment.status as RoomAssignmentStatus)) return;

        await this.examRoomAssignmentRepositoryService.updateById(assignment._id as Types.ObjectId, {
            disconnectedAt: new Date(),
        });
    }

    // Reconnect within the grace period — cancel the pending disconnect
    async handleParticipantJoined(roomName: string, identity: string): Promise<void> {
        const assignment = await this.resolveAssignment(roomName, identity);
        if (!assignment || !assignment.disconnectedAt) return;

        await this.examRoomAssignmentRepositoryService.updateById(assignment._id as Types.ObjectId, {
            disconnectedAt: null,
        } as any);
    }

}
