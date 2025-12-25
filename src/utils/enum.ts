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