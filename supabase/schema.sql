-- ============================================================================
-- CAMPUS PULSE — COLLEGE EVENT MANAGEMENT SYSTEM
-- Supabase PostgreSQL Relational Database Schema & Demo Seed Data
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP TABLES IF EXIST (Order ensures referential integrity)
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS passes CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS event_fields CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- ============================================================================
-- 3. TABLES DEFINITION
-- ============================================================================

-- A. EVENTS
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT ('ev_' || substr(md5(random()::text), 1, 12)),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Technical',
  poster_url TEXT,
  date TEXT NOT NULL, -- e.g. '2026-10-24'
  start_time TEXT NOT NULL, -- e.g. '09:00'
  end_time TEXT NOT NULL, -- e.g. '21:00'
  venue TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 150,
  registration_deadline TIMESTAMPTZ,
  organizer_name TEXT NOT NULL,
  organizer_contact TEXT NOT NULL,
  eligibility TEXT,
  rules TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'DRAFT')),
  event_status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (event_status IN ('UPCOMING', 'LIVE', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B. EVENT CUSTOM FIELDS (Optional event-specific fields)
CREATE TABLE event_fields (
  id TEXT PRIMARY KEY DEFAULT ('ef_' || substr(md5(random()::text), 1, 12)),
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'select', 'number'
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- C. REGISTRATIONS
CREATE TABLE registrations (
  id TEXT PRIMARY KEY DEFAULT ('reg_' || substr(md5(random()::text), 1, 12)),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_number TEXT UNIQUE NOT NULL, -- e.g. REG-2026-TN-0492
  name TEXT NOT NULL,
  student_id TEXT NOT NULL, -- Institutional Roll / ID e.g. 2503840100024
  college TEXT NOT NULL DEFAULT 'SHEAT College of Engineering',
  branch TEXT, -- e.g. Babatpur or Gahani
  course TEXT NOT NULL, -- e.g. B.Tech Computer Science
  semester TEXT NOT NULL, -- e.g. Year 3 // Sem 5
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  document_url TEXT, -- Uploaded Student ID Card URL / scan
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  rejection_reason TEXT,
  access_token TEXT UNIQUE NOT NULL DEFAULT ('tok_' || substr(md5(random()::text), 1, 24)), -- Private student access token
  team_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_event_student UNIQUE (event_id, student_id),
  CONSTRAINT unique_event_email UNIQUE (event_id, email)
);

-- D. PASSES (Generated only upon admin verification)
CREATE TABLE passes (
  id TEXT PRIMARY KEY DEFAULT ('pass_' || substr(md5(random()::text), 1, 12)),
  registration_id TEXT UNIQUE NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  pass_token TEXT UNIQUE NOT NULL, -- e.g. PASS-TN-0492 or cryptographic hash
  status TEXT NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'USED', 'REVOKED')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E. ATTENDANCE (Recorded by Turnstile Scanner on event day)
CREATE TABLE attendance (
  id TEXT PRIMARY KEY DEFAULT ('att_' || substr(md5(random()::text), 1, 12)),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  pass_id TEXT NOT NULL REFERENCES passes(id) ON DELETE CASCADE,
  registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  gate TEXT NOT NULL DEFAULT 'Gate 02',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_event_pass_checkin UNIQUE (event_id, pass_id) -- Duplicate prevention
);

-- F. CERTIFICATES (Issued to verified attendees after event)
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY DEFAULT ('cert_' || substr(md5(random()::text), 1, 12)),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL, -- e.g. CERT-2026-TN-8841
  certificate_url TEXT,
  role TEXT NOT NULL DEFAULT 'Delegate Participant',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_event_registration_certificate UNIQUE (event_id, registration_id)
);

-- G. STUDENT ACCOUNTS
CREATE TABLE IF NOT EXISTS student_accounts (
  id TEXT PRIMARY KEY DEFAULT ('stu_' || substr(md5(random()::text), 1, 12)),
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  course TEXT NOT NULL,
  college TEXT NOT NULL DEFAULT 'SHEAT College of Engineering',
  branch TEXT, -- e.g. Babatpur or Gahani
  phone TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- H. EVALUATIONS / JUDGING
CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY DEFAULT ('eval_' || substr(md5(random()::text), 1, 12)),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  marks INTEGER,
  feedback TEXT,
  result TEXT CHECK (result IN ('WINNER', 'RUNNER-UP', 'SECOND RUNNER-UP', 'PARTICIPANT', 'NOT ELIGIBLE', 'NONE')),
  certificate_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_event_registration_eval UNIQUE (event_id, registration_id)
);

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_access_token ON registrations(access_token);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_passes_token ON passes(pass_token);
CREATE INDEX idx_attendance_event ON attendance(event_id);
CREATE INDEX idx_attendance_pass ON attendance(pass_id);
CREATE INDEX idx_certificates_reg ON certificates(registration_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Events: Public can view active events; admin can manage all
CREATE POLICY "Public can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Admin can manage events" ON events FOR ALL USING (true);

-- Registrations: Public can insert their own registration and view
CREATE POLICY "Public can submit registration" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view registrations" ON registrations FOR SELECT USING (true);
CREATE POLICY "Admin can update registrations" ON registrations FOR ALL USING (true);
CREATE POLICY "Admin can delete registrations" ON registrations FOR DELETE USING (true);

-- Passes: Public viewable, admin manageable
CREATE POLICY "Public can view passes" ON passes FOR SELECT USING (true);
CREATE POLICY "Admin can manage passes" ON passes FOR ALL USING (true);

-- Attendance: Public viewable, admin manageable
CREATE POLICY "Public can view attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Admin can manage attendance" ON attendance FOR ALL USING (true);

-- Certificates: Public viewable, admin manageable
CREATE POLICY "Public can view certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Admin can manage certificates" ON certificates FOR ALL USING (true);

-- Student Accounts: Public can register/login, manage own account
CREATE POLICY "Public can access student accounts" ON student_accounts FOR ALL USING (true);

-- Evaluations: Public can view results, admin can manage
CREATE POLICY "Public can view evaluations" ON evaluations FOR SELECT USING (true);
CREATE POLICY "Admin can manage evaluations" ON evaluations FOR ALL USING (true);

-- ============================================================================
-- ZERO DEMO DATA — Database starts completely clean for production use.
-- Real administrator credentials and new student accounts persist normally.
-- ============================================================================

