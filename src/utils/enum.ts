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

export enum CourseType {
  UG = 'UG',
  PG = 'PG',
  DIPLOMA = 'DIPLOMA',
  PHD = 'PHD',
  MPhil = 'MPhil',
}

export enum QuestionType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER',
  LONG_ANSWER = 'LONG_ANSWER',
  TRUE_FALSE = 'TRUE_FALSE'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum AttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  TIME_UP = 'TIME_UP',
  SUBMITTED = 'SUBMITTED'
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


// Exam related enums
export enum ExamMode {
  AUTO = 'AUTO',
  PROCTORING = 'PROCTORING'
}

export enum ExamStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}

export enum ParticipantRole {
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT'
}

export enum ParticipantStatus {
  INVITED = 'INVITED',
  WAITING = 'WAITING',
  JOINED = 'JOINED',
  FINISHED = 'FINISHED',
  REMOVED = 'REMOVED',
  REJECTED = 'REJECTED',
  EXAM_ENDED = 'EXAM_ENDED'
}

export enum JoinRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum MessageType {
  BROADCAST = 'BROADCAST',
  DIRECT = 'DIRECT'
}

export enum StudentActionType {
  JOINED = 'JOINED',
  FINISHED = 'FINISHED',
  REMOVED = 'REMOVED',
  CAMERA_OFF = 'CAMERA_OFF',
  CAMERA_ON = 'CAMERA_ON',
  MIC_OFF = 'MIC_OFF',
  MIC_ON = 'MIC_ON',
  SCREEN_SHARE_STARTED = 'SCREEN_SHARE_STARTED',
  SCREEN_SHARE_STOPPED = 'SCREEN_SHARE_STOPPED',
  FULLSCREEN_EXITED = 'FULLSCREEN_EXITED'
}
