-- ============================================================================
-- CAMPUS PULSE — PRODUCTION DATABASE CLEANUP SCRIPT
-- Run this in your Supabase SQL Editor to wipe all legacy demo/seed data
-- while preserving real admin profile and newly registered students.
-- ============================================================================

-- 1. Ensure required columns exist
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE student_accounts ADD COLUMN IF NOT EXISTS branch TEXT;

-- 2. Remove all demo/mock attendance records
DELETE FROM attendance 
WHERE id IN ('att_001', 'att_002', 'att_003', 'att_004')
   OR gate LIKE '%Demo%';

-- 3. Remove all demo passes
DELETE FROM passes 
WHERE id IN ('pass_001', 'pass_002', 'pass_003', 'pass_004', 'pass_007')
   OR pass_token LIKE 'PASS-TN-%'
   OR pass_token LIKE '%DEMO%';

-- 4. Remove demo certificates and evaluations
DELETE FROM certificates 
WHERE id = 'cert_001'
   OR certificate_number LIKE '%NES-0192%';

DELETE FROM evaluations 
WHERE id = 'eval_001';

-- 5. Remove all demo registrations
DELETE FROM registrations 
WHERE id IN ('reg_001', 'reg_002', 'reg_003', 'reg_004', 'reg_005', 'reg_006', 'reg_007', 'reg_008')
   OR access_token LIKE '%demo%'
   OR access_token LIKE '%alex_chen%'
   OR access_token LIKE '%maya_lin%'
   OR access_token LIKE '%ryan_patel%'
   OR access_token LIKE '%sarah_jenkins%';

-- 6. Remove all demo events
DELETE FROM events 
WHERE id IN ('ev_technova', 'ev_aurora', 'ev_robowars', 'ev_esummit')
   OR slug IN ('technova-2026', 'aurora-2026', 'robowars-2026', 'esummit-2026');

-- 7. Verification check: Output active count of clean tables
SELECT 'events' AS table_name, count(*) FROM events
UNION ALL
SELECT 'registrations', count(*) FROM registrations
UNION ALL
SELECT 'passes', count(*) FROM passes
UNION ALL
SELECT 'attendance', count(*) FROM attendance
UNION ALL
SELECT 'certificates', count(*) FROM certificates
UNION ALL
SELECT 'evaluations', count(*) FROM evaluations
UNION ALL
SELECT 'student_accounts', count(*) FROM student_accounts;
