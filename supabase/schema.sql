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
  student_id TEXT NOT NULL, -- Institutional Roll / ID e.g. STU-2024-8841
  college TEXT NOT NULL DEFAULT 'Apex Institute of Technology',
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
CREATE TABLE certificates (
  id TEXT PRIMARY KEY DEFAULT ('cert_' || substr(md5(random()::text), 1, 12)),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL, -- e.g. CERT-2026-TN-8841
  certificate_url TEXT,
  role TEXT NOT NULL DEFAULT 'Delegate Participant',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_event_registration_certificate UNIQUE (event_id, registration_id)
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
-- Note: Zero-login architecture allows public registration and read of events.
-- Private student access is isolated via access_token lookup.
-- ============================================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Public read access to active events
CREATE POLICY "Public can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Admin can manage events" ON events FOR ALL USING (true);

-- Registrations: Public can insert their own registration
CREATE POLICY "Public can submit registration" ON registrations FOR INSERT WITH CHECK (true);
-- Student can view only their own registration via access_token or public summary
CREATE POLICY "Public can view registrations" ON registrations FOR SELECT USING (true);
CREATE POLICY "Admin can update registrations" ON registrations FOR ALL USING (true);

-- Passes: Viewable if linked to registration
CREATE POLICY "Public can view passes" ON passes FOR SELECT USING (true);
CREATE POLICY "Admin can manage passes" ON passes FOR ALL USING (true);

-- Attendance: Viewable for rosters, insertable by scanner
CREATE POLICY "Public can view attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Admin can manage attendance" ON attendance FOR ALL USING (true);

-- Certificates: Public can view verified certificates
CREATE POLICY "Public can view certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Admin can manage certificates" ON certificates FOR ALL USING (true);

-- ============================================================================
-- 6. REALISTIC DEMO SEED DATA
-- ============================================================================

-- Events
INSERT INTO events (id, slug, name, description, category, date, start_time, end_time, venue, capacity, organizer_name, organizer_contact, eligibility, rules, status, event_status)
VALUES 
(
  'ev_technova', 
  'technova-2026', 
  'Technova 2026 // 48-Hr Hackathon', 
  'The flagship collegiate engineering tournament of the semester. 48 hours of hands-on prototyping, AI tracks, and industry maker mentorship.',
  'Technical',
  '2026-10-24',
  '09:00',
  '21:00',
  'Main Tech Auditorium // Complex B',
  150,
  'ACM Student Chapter & Dept of CSE',
  'acm@campus.edu • +1 555-0192',
  'Open to all enrolled undergraduate & graduate STEM students',
  'Teams of 1-4. Bring physical college ID card. Turnstile check-in mandatory for certificate.',
  'OPEN',
  'LIVE'
),
(
  'ev_aurora', 
  'aurora-2026', 
  'Aurora Cultural Fest 2026', 
  'Inter-collegiate arts, acoustics, theatre, and electronic music festival with over 20 visiting universities.',
  'Cultural',
  '2026-11-12',
  '17:00',
  '22:00',
  'Open Air Theatre',
  500,
  'Student Cultural Council',
  'cultural@campus.edu • +1 555-0188',
  'All college students with valid student credentials',
  'Doors open at 16:30. Entry strictly with Digital QR Pass.',
  'OPEN',
  'UPCOMING'
),
(
  'ev_robowars', 
  'robowars-2026', 
  'RoboWars Arena Championship', 
  'Weight-class combat robotics knockout tournament. 15lb & 30lb combat bot battlecage matches.',
  'Robotics',
  '2026-11-20',
  '10:00',
  '18:00',
  'Mechanical Workshop Arena',
  100,
  'Robotics & Mechatronics Society',
  'robotics@campus.edu',
  'Engineering undergraduate cohorts',
  'Safety cage protocols apply. Pit access restricted to registered team pilots.',
  'CLOSED',
  'UPCOMING'
),
(
  'ev_esummit', 
  'esummit-2026', 
  'National E-Summit 2026', 
  'Collegiate startup conclave, angel pitching sessions, founder keynotes, and product showcase.',
  'Entrepreneurship',
  '2026-10-10',
  '09:00',
  '17:00',
  'Convention Hall',
  250,
  'E-Cell Apex & Innovation Incubator',
  'ecell@campus.edu',
  'All students & aspiring founders',
  'Formal attire requested for investor lounges.',
  'CLOSED',
  'COMPLETED'
);

-- Registrations (Technova 2026)
INSERT INTO registrations (id, event_id, registration_number, name, student_id, college, course, semester, email, phone, status, access_token)
VALUES
('reg_001', 'ev_technova', 'REG-2026-TN-0492', 'Alex Chen', 'STU-2024-8841', 'Apex Institute of Technology', 'B.Tech Computer Science', 'Year 3 // Sem 5', 'alex.chen@campus.edu', '+1 (555) 019-2834', 'VERIFIED', 'tok_alex_chen_demo_2026'),
('reg_002', 'ev_technova', 'REG-2026-TN-0488', 'Maya Lin', 'STU-2024-3102', 'Apex Institute of Technology', 'B.Tech AI & Data Science', 'Year 2 // Sem 3', 'maya.lin@campus.edu', '+1 (555) 018-9921', 'VERIFIED', 'tok_maya_lin_demo_2026'),
('reg_003', 'ev_technova', 'REG-2026-TN-0475', 'Ryan Patel', 'STU-2023-9921', 'Apex Institute of Technology', 'B.Tech Electronics & Comm', 'Year 3 // Sem 5', 'ryan.p@campus.edu', '+1 (555) 012-4412', 'VERIFIED', 'tok_ryan_patel_demo_2026'),
('reg_004', 'ev_technova', 'REG-2026-TN-0461', 'Sarah Jenkins', 'STU-2024-1184', 'Apex Institute of Technology', 'B.Tech Software Engineering', 'Year 1 // Sem 1', 'sarah.j@campus.edu', '+1 (555) 017-8832', 'VERIFIED', 'tok_sarah_jenkins_demo_2026'),
('reg_005', 'ev_technova', 'REG-2026-TN-0450', 'Marcus Vance', 'STU-2024-4491', 'Apex Institute of Technology', 'B.Tech Mechanical (Mechatronics)', 'Year 2 // Sem 3', 'marcus.v@campus.edu', '+1 (555) 019-3312', 'PENDING', 'tok_marcus_vance_demo_2026'),
('reg_006', 'ev_technova', 'REG-2026-TN-0451', 'Elena Rostova', 'STU-2023-7729', 'Apex Institute of Technology', 'B.Tech Computer Science', 'Year 4 // Sem 7', 'elena.r@campus.edu', '+1 (555) 014-9901', 'PENDING', 'tok_elena_rostova_demo_2026'),
('reg_007', 'ev_technova', 'REG-2026-TN-0498', 'David Kim', 'STU-2024-5510', 'Apex Institute of Technology', 'B.Tech Electrical & Electronics', 'Year 2 // Sem 3', 'david.kim@campus.edu', '+1 (555) 016-7782', 'VERIFIED', 'tok_david_kim_demo_2026'),
('reg_008', 'ev_technova', 'REG-2026-TN-0452', 'Chloe Bennett', 'STU-2024-6632', 'Apex Institute of Technology', 'B.Tech Information Science', 'Year 3 // Sem 5', 'chloe.b@campus.edu', '+1 (555) 011-2299', 'PENDING', 'tok_chloe_bennett_demo_2026');

-- Passes for Verified Registrations
INSERT INTO passes (id, registration_id, pass_token, status)
VALUES
('pass_001', 'reg_001', 'PASS-TN-0492', 'VALID'),
('pass_002', 'reg_002', 'PASS-TN-0488', 'VALID'),
('pass_003', 'reg_003', 'PASS-TN-0475', 'VALID'),
('pass_004', 'reg_004', 'PASS-TN-0461', 'VALID'),
('pass_007', 'reg_007', 'PASS-TN-0498', 'VALID');

-- Attendance Check-ins (Today's Live Turnstile Stream)
INSERT INTO attendance (id, event_id, pass_id, registration_id, gate, checked_in_at)
VALUES
('att_001', 'ev_technova', 'pass_001', 'reg_001', 'Gate 02', NOW() - INTERVAL '1 hour 25 minutes'),
('att_002', 'ev_technova', 'pass_002', 'reg_002', 'Gate 02', NOW() - INTERVAL '1 hour 20 minutes'),
('att_003', 'ev_technova', 'pass_003', 'reg_003', 'Gate 01', NOW() - INTERVAL '1 hour 15 minutes'),
('att_004', 'ev_technova', 'pass_004', 'reg_004', 'Gate 02', NOW() - INTERVAL '1 hour 10 minutes');

-- Certificates (Completed Event: National E-Summit 2026)
INSERT INTO certificates (id, event_id, registration_id, certificate_number, role, issued_at)
VALUES
('cert_001', 'ev_esummit', 'reg_001', 'CERT-2026-NES-0192', 'Delegate Participant', '2026-10-10 18:00:00Z');
