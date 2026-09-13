export type EventCategory = 'Technical' | 'Cultural' | 'Robotics' | 'Entrepreneurship' | 'Academic';
export type EventRegStatus = 'OPEN' | 'CLOSED' | 'DRAFT';
export type EventLifecycleStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export interface EventItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: EventCategory | string;
  poster_url?: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  capacity: number;
  registration_deadline?: string;
  organizer_name: string;
  organizer_contact: string;
  eligibility?: string;
  rules?: string;
  status: EventRegStatus;
  event_status: EventLifecycleStatus;
  created_at?: string;
  // Computed fields
  registered_count?: number;
  verified_count?: number;
  checkins_count?: number;
  is_archived?: boolean;
}

export type RegistrationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type EvaluationResult = 'WINNER' | 'RUNNER-UP' | 'SECOND RUNNER-UP' | 'PARTICIPANT' | 'NOT ELIGIBLE' | 'NONE';

export interface EvaluationItem {
  id: string;
  event_id: string;
  registration_id: string;
  student_id: string;
  student_name?: string;
  course?: string;
  marks?: number | null;
  feedback?: string | null;
  result?: EvaluationResult;
  certificate_eligible?: boolean;
  updated_at?: string;
}

export type BranchOption = 'B.Tech CSE - Babatpur' | 'B.Tech CSE - Gahani' | 'Babatpur' | 'Gahani';

export function formatBranch(branch?: string | null): string {
  if (!branch) return '';
  if (branch.includes('Babatpur')) return 'Babatpur';
  if (branch.includes('Gahani')) return 'Gahani';
  return branch;
}

export interface AdminProfile {
  name: string;
  email: string;
  title: string;
  phone?: string;
  department?: string;
  updated_at?: string;
}

export interface StudentAccount {
  id: string;
  name?: string;
  full_name?: string;
  student_id: string;
  email: string;
  course: string;
  college: string;
  branch?: BranchOption | string;
  semester?: string;
  phone?: string;
  password?: string; // sensitive, excluded in client responses
  created_at?: string;
}

export interface RegistrationItem {
  id: string;
  event_id: string;
  registration_number: string;
  name: string;
  student_id: string;
  college: string;
  branch?: BranchOption | string;
  course: string;
  semester: string;
  email: string;
  phone: string;
  document_url?: string;
  status: RegistrationStatus;
  rejection_reason?: string;
  access_token: string;
  team_name?: string;
  created_at: string;
  // Evaluation & Result fields
  marks?: number | null;
  feedback?: string | null;
  result?: EvaluationResult;
  certificate_eligible?: boolean;
  certificate_issued?: boolean;
  certificate_id?: string | null;
  // Joined or augmented fields
  pass_token?: string | null;
  pass_id?: string | null;
  checked_in?: boolean;
  checkin_time?: string | null;
  gate?: string | null;
  event_name?: string;
  events?: Partial<EventItem>;
}

export type PassStatus = 'VALID' | 'USED' | 'REVOKED';

export interface DigitalPassItem {
  id: string;
  registration_id: string;
  pass_token: string;
  status: PassStatus;
  generated_at: string;
  // Augmented
  event?: EventItem;
  registration?: RegistrationItem;
}

export interface AttendanceRecord {
  id: string;
  event_id: string;
  pass_id: string;
  registration_id: string;
  gate: string;
  checked_in_at: string;
  // Augmented
  student_name?: string;
  student_id?: string;
  pass_token?: string;
  course?: string;
}

export interface CertificateItem {
  id: string;
  event_id: string;
  registration_id: string;
  certificate_number: string;
  certificate_url?: string;
  role: string;
  result?: string;
  marks?: number | null;
  issued_at: string;
  event_name?: string;
  student_name?: string;
  student_id?: string;
  event_date?: string;
}

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  pendingVerifications: number;
  verifiedStudents: number;
  todayCheckins: number;
  attendanceRate: number;
  certificatesIssued: number;
}

