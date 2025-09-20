export enum Country {
  INDIA = 'India',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHERS = 'OTHERS',
}

export enum MaritalStatus {
  SINGLE = 'Single',
  MARRIED = 'Married',
  DIVORCED = 'Divorced',
  WIDOWED = 'Widowed',
}

export enum Nationality {
  INDIAN = 'Indian'
}

export enum Status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  GRADUATED = 'Graduated',
  DROPPED = 'Dropped',
}

export enum ExamMode {
  AUTO = 'AUTO',
  PROCTORING = 'PROCTORING'
}

export enum ProctoringMode {
  LIVE = 'LIVE',
  AUTO = 'AUTO'
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