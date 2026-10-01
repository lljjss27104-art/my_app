export type ClubCategory =
  | 'IT/코딩'
  | '학술/연구'
  | '문화/예술'
  | '봉사/사회'
  | '스포츠/레저'
  | '창업/경영'
  | '기타';

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'link'
  | 'timeSlot';

export interface FormQuestion {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  maxChars?: number;
}

export type RecruitmentStatus = 'recruiting' | 'closed' | 'upcoming';

export interface Club {
  id: string;
  name: string;
  category: ClubCategory;
  shortDesc: string;
  fullDesc: string;
  coverImage: string;
  tags: string[];
  leaderName: string;
  contactEmail: string;
  contactPhone: string;
  regularMeetingTime: string;
  membershipFee: string;
  location: string;
  requirements: string[];
  recruitmentPeriod: {
    start: string;
    end: string;
  };
  activeStatus: RecruitmentStatus;
  questions: FormQuestion[];
  targetRecruitCount?: number;
}

export type ApplicationStatus =
  | 'submitted' // 접수완료
  | 'reviewing' // 서류심사중
  | 'doc_passed' // 서류통과
  | 'interview_scheduled' // 면접예정
  | 'accepted' // 최종합격
  | 'rejected'; // 불합격

export interface ApplicantInfo {
  name: string;
  studentId: string;
  department: string;
  grade: '1학년' | '2학년' | '3학년' | '4학년' | '대학원생' | '휴학생';
  phone: string;
  email: string;
}

export interface EvaluationCriteria {
  passion: number; // 지원동기 및 열정 (0-40)
  competency: number; // 분야 역량 및 포트폴리오 (0-40)
  attendance: number; // 정기일정 및 협업 태도 (0-20)
}

export interface ApplicantEvaluation {
  score: number; // total out of 100
  criteria: EvaluationCriteria;
  notes: string;
  reviewedBy: string;
  reviewedAt: string;
}

export interface InterviewSchedule {
  date: string;
  time: string;
  location: string;
  interviewerNotes?: string;
}

export interface Application {
  id: string;
  clubId: string;
  clubName: string;
  submittedAt: string;
  updatedAt: string;
  applicant: ApplicantInfo;
  answers: Record<string, string | string[]>;
  status: ApplicationStatus;
  evaluation?: ApplicantEvaluation;
  interviewSchedule?: InterviewSchedule;
  statusNotificationNote?: string;
}
