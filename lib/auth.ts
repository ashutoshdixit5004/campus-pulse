import { StudentAccount } from '@/types/database';

export const ADMIN_CONFIG = {
  name: 'Dr. Vipasha',
  title: 'Dean of Student Affairs // Admin',
  emails: ['dr.vipasha@campus.edu', 'vipasha@sheat.edu', 'admin@sheat.edu', 'admin@campus.edu', 'admin', 'vipasha'],
  // Default development / evaluation fallback credentials (never exposed in client bundles)
  defaultPassword: process.env.ADMIN_PASSWORD || 'admin123',
};

// ============================================================================
// ADMIN SESSION MANAGEMENT
// ============================================================================

export interface AdminSession {
  token: string;
  name: string;
  title: string;
  email: string;
  loginAt: string;
}

const ADMIN_STORAGE_KEY = 'campuspulse_admin_session';
const STUDENT_STORAGE_KEY = 'campuspulse_student_session';

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function setAdminSession(session: AdminSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
    // Also set a lightweight cookie so middleware/layouts can detect session
    document.cookie = `${ADMIN_STORAGE_KEY}=${session.token}; path=/; SameSite=Lax; max-age=86400`;
  } catch (err) {
    console.error('Error saving admin session:', err);
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    document.cookie = `${ADMIN_STORAGE_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } catch (err) {
    console.error('Error clearing admin session:', err);
  }
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminSession());
}

// ============================================================================
// STUDENT SESSION MANAGEMENT
// ============================================================================

export type StudentSession = Omit<StudentAccount, 'password'>;

export function getStudentSession(): StudentSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function setStudentSession(student: StudentSession): void {
  if (typeof window === 'undefined') return;
  try {
    // Strip password if present before writing to storage
    const { password, ...safeStudent } = student as any;
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(safeStudent));
    document.cookie = `${STUDENT_STORAGE_KEY}=${safeStudent.student_id}; path=/; SameSite=Lax; max-age=604800`;
  } catch (err) {
    console.error('Error saving student session:', err);
  }
}

export function clearStudentSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STUDENT_STORAGE_KEY);
    document.cookie = `${STUDENT_STORAGE_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } catch (err) {
    console.error('Error clearing student session:', err);
  }
}

export function isStudentAuthenticated(): boolean {
  return Boolean(getStudentSession());
}
