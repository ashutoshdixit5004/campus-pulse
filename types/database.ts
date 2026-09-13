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
}

export type RegistrationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface RegistrationItem {
  id: string;
  event_id: string;
  registration_number: string;
  name: string;
  student_id: string;
  college: string;
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
  issued_at: string;
  event_name?: string;
  student_name?: string;
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
