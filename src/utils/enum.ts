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

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISH = 'PUBLISH',
}

export enum AudienceType {
  BATCH = 'BATCH',
  COURSE = 'COURSE',
  BRANCH = 'BRANCH',
  SECTION = 'SECTION'
}

export enum QuestionRandomizationLevel {
  QUESTION = 'QUESTION',
  OPTION = 'OPTION',
  BOTH = 'BOTH',
  NONE = 'NONE'
}

export enum ProctoringMode {
  LIVE = 'LIVE',
  AUTO = 'AUTO'
}

export enum CorrectionMode {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
  HYBRID = 'HYBRID'
}

export enum QuestionType {
  MCQ = 'MCQ',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
  SHORT_ANSWER = 'SHORT_ANSWER',
  LONG_ANSWER = 'LONG_ANSWER',
  ESSAY = 'ESSAY',
  NUMERICAL = 'NUMERICAL',
  MATCHING = 'MATCHING',
  ORDERING = 'ORDERING'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum BloomsTaxonomy {
  REMEMBER = 'REMEMBER',
  UNDERSTAND = 'UNDERSTAND',
  APPLY = 'APPLY',
  ANALYZE = 'ANALYZE',
  EVALUATE = 'EVALUATE',
  CREATE = 'CREATE'
}

export enum ExamAttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  SUBMITTED = 'SUBMITTED',
  AUTO_SUBMITTED = 'AUTO_SUBMITTED',
  CANCELLED = 'CANCELLED',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

export enum QuestionAttemptStatus {
  NOT_ATTEMPTED = 'NOT_ATTEMPTED',
  ATTEMPTED = 'ATTEMPTED',
  MARKED_FOR_REVIEW = 'MARKED_FOR_REVIEW',
  ANSWERED_AND_MARKED = 'ANSWERED_AND_MARKED'
}

export enum ProctoringViolationType {
  TAB_SWITCH = 'TAB_SWITCH',
  WINDOW_BLUR = 'WINDOW_BLUR',
  FULLSCREEN_EXIT = 'FULLSCREEN_EXIT',
  MULTIPLE_FACES = 'MULTIPLE_FACES',
  NO_FACE_DETECTED = 'NO_FACE_DETECTED',
  SUSPICIOUS_MOVEMENT = 'SUSPICIOUS_MOVEMENT',
  EXTERNAL_DEVICE = 'EXTERNAL_DEVICE',
  COPY_PASTE = 'COPY_PASTE',
  RIGHT_CLICK = 'RIGHT_CLICK',
  KEYBOARD_SHORTCUT = 'KEYBOARD_SHORTCUT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export enum ResultStatus {
  PENDING = 'PENDING',
  UNDER_EVALUATION = 'UNDER_EVALUATION',
  PUBLISHED = 'PUBLISHED',
  WITHHELD = 'WITHHELD',
  CANCELLED = 'CANCELLED'
}

export enum GradeScale {
  A_PLUS = 'A+',
  A = 'A',
  B_PLUS = 'B+',
  B = 'B',
  C_PLUS = 'C+',
  C = 'C',
  D = 'D',
  F = 'F'
}

export enum CourseType {
  UG = 'UG',
  PG = 'PG',
  DIPLOMA = 'DIPLOMA',
  PHD = 'PHD',
  MPhil = 'MPhil',
}