export class RoomOverviewAssignment {
    assignmentId: string;
    examId: string;
    examName: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    studentEmail: string;
    status: string;
    enteredWaitingRoomAt?: Date;
    admittedAt?: Date;
    removedAt?: Date;
    removalReason?: string;
}

export class RoomOverviewData {
    roomId: string;
    facultyId: string;
    facultyCode: string;
    facultyName: string;
    facultyEmail: string;
    liveKitSessionId: string;
    startDateTime: Date;
    endDateTime: Date;
    durationMinutes: number;
    // Persisted room status (in practice always SCHEDULED — see the
    // repository note) alongside the time-derived one this page actually
    // renders and filters by
    status: string;
    effectiveStatus: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
    // Every exam represented in this room — more than one when pooled
    examNames: string[];
    waitingCount: number;
    admittedCount: number;
    inProgressCount: number;
    completedCount: number;
    removedOrRejectedCount: number;
    totalOccupancy: number;
    assignments: RoomOverviewAssignment[];
}

export class PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class GetAllExamRoomsResponse {
    success: boolean;
    message: string;
    data?: {
        rooms: RoomOverviewData[];
        pagination: PaginationMeta;
        // Counts for the status-chip tabs, computed across ALL rooms
        // regardless of the current filter/page, so tab badges stay stable
        statusCounts: { upcoming: number; inProgress: number; completed: number };
    };
}
