
export type FacultyRole = 'CLASS_COORDINATOR' | 'COURSE_COORDINATOR' | 'PRINCIPAL' | 'NORMAL_FACULTY';
export type UserRole = 'STUDENT' | FacultyRole;

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type CollegeClass = 
  | '1yr BSc Nursing' | '2yr BSc Nursing' | '3yr BSc Nursing' | '4yr BSc Nursing'
  | '1yr GNM' | '2yr GNM' | '3yr GNM' | '4yr GNM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedClass?: CollegeClass; // For Class Coordinators
  courseType?: 'BSc Nursing' | 'GNM'; // For Course Coordinators
  studentId?: string;
}

export interface LeaveApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantRole: UserRole;
  studentClass?: CollegeClass; // Mandatory for students
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  aiSummary?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  
  // 3-Stage Workflow
  ccStatus: ApprovalStatus;
  cocStatus: ApprovalStatus;
  principalStatus: ApprovalStatus;
  
  appliedDate: string;
  facultyComments?: string;
}

export const LEAVE_TYPES = [
  'Medical Leave',
  'Personal Emergency',
  'Family Event',
  'Academic Work',
  'Other'
];

export const CLASSES: CollegeClass[] = [
  '1yr BSc Nursing', '2yr BSc Nursing', '3yr BSc Nursing', '4yr BSc Nursing',
  '1yr GNM', '2yr GNM', '3yr GNM', '4yr GNM'
];
