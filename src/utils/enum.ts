export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
}

export enum FacultyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  RETIRED = 'RETIRED',
  PENDING = 'PENDING',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHERS = 'OTHERS',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum Nationality {
  INDIAN = 'INDIAN'
}

export enum ExamMode {
  AUTO = 'AUTO',
  PROCTORING = 'PROCTORING'
}

export enum CourseType {
  UG = 'UG',
  PG = 'PG',
  DIPLOMA = 'DIPLOMA',
  PHD = 'PHD',
  MPhil = 'MPhil',
}

export enum QuestionType {
  MCQ = 'MCQ',
  MSQ = 'MSQ',
  WRITTEN = 'WRITTEN'
}

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  RESULTS_PUBLISHED = 'RESULTS_PUBLISHED'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum AttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED'
}

export enum SubmissionTrigger {
  MANUAL = 'MANUAL',
  TIMER_EXPIRY = 'TIMER_EXPIRY',
  INTEGRITY_AUTO_SUBMIT = 'INTEGRITY_AUTO_SUBMIT',
  FACULTY_REMOVED = 'FACULTY_REMOVED',
  CONNECTION_LOSS = 'CONNECTION_LOSS'
}

export enum MediaStatus {
  PENDING_UPLOAD = 'PENDING_UPLOAD',
  UPLOADING = 'UPLOADING',
  UPLOAD_COMPLETE = 'UPLOAD_COMPLETE',
  UPLOAD_FAILED = 'UPLOAD_FAILED'
}

export enum RecordingMediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
  SCREEN = 'screen'
}

export enum AdmissionType {
  REGULAR = 'REGULAR',
  LATERAL = 'LATERAL',
  MANAGEMENT = 'MANAGEMENT'
}

export enum Country {
  INDIA = 'INDIA'
}

export enum EducationLevel {
  SECONDARY = 'SECONDARY',
  HIGHER_SECONDARY = 'HIGHER_SECONDARY',
  DIPLOMA = 'DIPLOMA',
  UNDERGRADUATE = 'UNDERGRADUATE',
  POSTGRADUATE = 'POSTGRADUATE'
}

export enum Qualification {
  TENTH = '10th',
  TWELFTH = '12th',
  DIPLOMA = 'Diploma',
  DEGREE = 'Degree',
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  ALUMNI = 'ALUMNI',
  DROPOUT = 'DROPOUT',
  SUSPENDED = 'SUSPENDED',
  ON_LEAVE = 'ON_LEAVE'
}

export enum RelationType {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GUARDIAN = 'GUARDIAN',
  RELATIVE = 'RELATIVE',
  OTHER = 'OTHER'
}

export enum BoardType {
  STATE_BOARD = 'STATE_BOARD',
  CBSE = 'CBSE',
  ICSE = 'ICSE',
  IB = 'IB',
  OTHER = 'OTHER'
}

export enum FacultyDesignation {
  ASSISTANT_PROFESSOR = 'ASSISTANT_PROFESSOR',
  ASSOCIATE_PROFESSOR = 'ASSOCIATE_PROFESSOR',
  PROFESSOR = 'PROFESSOR',
  LECTURER = 'LECTURER',
  HOD = 'HOD',
  PRINCIPAL = 'PRINCIPAL',
}

export enum EmploymentType {
  PERMANENT = 'PERMANENT',
  CONTRACT = 'CONTRACT',
  VISITING = 'VISITING',
  GUEST = 'GUEST',
  ADJUNCT = 'ADJUNCT',
}

export enum HighestQualification {
  PhD = 'PhD',
  MTECH = 'MTECH',
  ME = 'ME',
  MBA = 'MBA',
  MSC = 'MSC',
  BE = 'BE',
  BTECH = 'BTECH',
  OTHER = 'OTHER',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum SubjectType {
  THEORY = 'THEORY',
  PRACTICAL = 'PRACTICAL',
  ELECTIVE = 'ELECTIVE',
}

export enum ExamRoomStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum RoomAssignmentStatus {
  WAITING = 'WAITING',
  ADMITTED = 'ADMITTED',
  IN_PROGRESS = 'IN_PROGRESS',
  REJECTED = 'REJECTED',
  REMOVED = 'REMOVED',
  COMPLETED = 'COMPLETED',
}

export enum ChatSenderRole {
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
}

export enum ChatRecipientType {
  INDIVIDUAL = 'INDIVIDUAL',
  BROADCAST_ROOM = 'BROADCAST_ROOM',
  BROADCAST_EXAM = 'BROADCAST_EXAM',
}
