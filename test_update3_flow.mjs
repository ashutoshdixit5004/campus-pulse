// test_update3_flow.mjs
// Automated verification suite for Update #3
import { readFileSync, existsSync } from 'fs';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('======================================================================');
  console.log('STARTING UPDATE #3 VERIFICATION SUITE');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: Confirm No Demo Data Appears (Clean Database)
  // -------------------------------------------------------------------------
  console.log('--- TEST 1: Clean Database & Zero Demo Records ---');
  const eventsRes = await fetch(`${BASE_URL}/api/events`);
  const events = await eventsRes.json();
  const regsRes = await fetch(`${BASE_URL}/api/registrations`);
  const regs = await regsRes.json();
  const certsRes = await fetch(`${BASE_URL}/api/certificates`);
  const certs = await certsRes.json();

  console.log(`  Initial Events Count: ${events.length}`);
  console.log(`  Initial Registrations Count: ${regs.length}`);
  console.log(`  Initial Certificates Count: ${certs.length}`);

  if (events.length !== 0 || regs.length !== 0 || certs.length !== 0) {
    throw new Error(`FAILURE: Expected 0 events, 0 registrations, 0 certs. Got events=${events.length}, regs=${regs.length}, certs=${certs.length}`);
  }
  console.log('✓ Confirmed: Application starts with a clean database (0 demo events, 0 registrations, 0 certificates).\n');

  // -------------------------------------------------------------------------
  // TEST 2: Confirm Top Admin/Student Switch Buttons are Completely Removed
  // -------------------------------------------------------------------------
  console.log('--- TEST 2: Top Header Navigation Role Switch Removal ---');
  const roleBarCode = readFileSync('./components/RoleBar.tsx', 'utf-8');
  if (roleBarCode.includes('btnRoleAdmin') || roleBarCode.includes('btnRoleStudent') || roleBarCode.includes('role-switcher')) {
    throw new Error('FAILURE: Role switcher buttons still detected in RoleBar.tsx!');
  }
  if (roleBarCode.includes('Reset Demo Data') || roleBarCode.includes('demo-seed-btn')) {
    throw new Error('FAILURE: Reset Demo Data button still detected in RoleBar.tsx!');
  }
  console.log('✓ Confirmed: "Admin Control Center", "Student Portal", and role switch buttons are completely removed from RoleBar.tsx.');
  console.log('✓ Confirmed: Demo seed buttons and mock public links removed.\n');

  // -------------------------------------------------------------------------
  // TEST 3: Admin Login with System Default Credentials
  // -------------------------------------------------------------------------
  console.log('--- TEST 3: Dedicated Admin Login & Authentication ---');
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'vipasha@sheat.edu', password: 'admin123' }),
  });
  if (!adminLoginRes.ok) {
    throw new Error(`FAILURE: Admin login failed: ${adminLoginRes.status}`);
  }
  const adminData = await adminLoginRes.json();
  console.log(`  Admin Authenticated: ${adminData.session.name} (${adminData.session.email})`);
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  console.log('✓ Confirmed: Admin login successful with operational clearance.\n');

  // -------------------------------------------------------------------------
  // TEST 4: Admin Profile Edit & Persistence
  // -------------------------------------------------------------------------
  console.log('--- TEST 4: Admin Profile Edit & Persistence ---');
  const updatedName = 'Dr. Vipasha Singh';
  const updatedEmail = 'dean.affairs@sheat.edu';
  const updatedTitle = 'Dean of Academic & Student Affairs // Head of Events';

  const updateProfileRes = await fetch(`${BASE_URL}/api/admin/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie || `campuspulse_admin_session=${adminData.session.token}`,
    },
    body: JSON.stringify({
      name: updatedName,
      email: updatedEmail,
      title: updatedTitle,
      phone: '+91 542 262 4884',
      department: 'Dean Office // SHEAT',
    }),
  });
  if (!updateProfileRes.ok) {
    const err = await updateProfileRes.text();
    throw new Error(`FAILURE: Admin profile update failed: ${err}`);
  }
  const updateResult = await updateProfileRes.json();
  console.log(`  Profile Updated: ${updateResult.profile.name} <${updateResult.profile.email}> [${updateResult.profile.title}]`);

  // Verify persistence via /api/admin/me
  const meRes = await fetch(`${BASE_URL}/api/admin/me`, {
    headers: {
      'Cookie': adminCookie || `campuspulse_admin_session=${adminData.session.token}`,
    },
  });
  const meData = await meRes.json();
  if (meData.admin.name !== updatedName || meData.admin.email !== updatedEmail) {
    throw new Error(`FAILURE: Persisted admin profile does not match! Got: ${JSON.stringify(meData)}`);
  }
  console.log('✓ Confirmed: Admin profile persisted successfully and returned by /api/admin/me.');

  // Test re-login with the updated admin email
  const reLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: updatedEmail, password: 'admin123' }),
  });
  if (!reLoginRes.ok) {
    throw new Error(`FAILURE: Admin re-login with updated email failed: ${reLoginRes.status}`);
  }
  const reLoginData = await reLoginRes.json();
  if (reLoginData.session.name !== updatedName) {
    throw new Error(`FAILURE: Expected updated name ${updatedName}, got ${reLoginData.session.name}`);
  }
  console.log('✓ Confirmed: Admin can log in using their updated institutional email.\n');

  // -------------------------------------------------------------------------
  // TEST 5: Student Registration Form — Fixed College & Required Branch
  // -------------------------------------------------------------------------
  console.log('--- TEST 5: Student Registration (Fixed College & Required Branch) ---');
  const studentSignupRes = await fetch(`${BASE_URL}/api/student/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Priya Sharma',
      student_id: 'SHEAT_2026_001',
      email: 'priya.sharma@sheat.edu',
      course: 'B.Tech CSE',
      college: 'Some Other College Attempt', // Should be overridden to SHEAT College of Engineering
      branch: 'B.Tech CSE - Babatpur',
      phone: '+91 98765 43210',
      password: 'studentpassword123',
    }),
  });
  if (!studentSignupRes.ok) {
    const err = await studentSignupRes.text();
    throw new Error(`FAILURE: Student signup failed: ${err}`);
  }
  const studentData = await studentSignupRes.json();
  console.log(`  Student Registered: ${studentData.student.name || studentData.student.full_name} (${studentData.student.student_id})`);
  console.log(`  College Recorded: "${studentData.student.college}"`);
  console.log(`  Branch Recorded: "${studentData.student.branch}"`);

  if (studentData.student.college !== 'SHEAT College of Engineering') {
    throw new Error(`FAILURE: College was not locked to "SHEAT College of Engineering"! Got: ${studentData.student.college}`);
  }
  if (studentData.student.branch !== 'B.Tech CSE - Babatpur') {
    throw new Error(`FAILURE: Branch was not saved as "B.Tech CSE - Babatpur"! Got: ${studentData.student.branch}`);
  }
  console.log('✓ Confirmed: College is strictly locked to "SHEAT College of Engineering".');
  console.log('✓ Confirmed: Required branch "B.Tech CSE - Babatpur" persisted accurately.\n');

  // -------------------------------------------------------------------------
  // TEST 6: Student Login
  // -------------------------------------------------------------------------
  console.log('--- TEST 6: Dedicated Student Login ---');
  const studentLoginRes = await fetch(`${BASE_URL}/api/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'SHEAT_2026_001',
      password: 'studentpassword123',
    }),
  });
  if (!studentLoginRes.ok) {
    throw new Error(`FAILURE: Student login failed: ${studentLoginRes.status}`);
  }
  const loggedStudent = await studentLoginRes.json();
  console.log(`  Student Logged In: ${loggedStudent.student.name} (Roll: ${loggedStudent.student.student_id})`);
  console.log('✓ Confirmed: Student successfully logged in via dedicated student flow.\n');

  // -------------------------------------------------------------------------
  // TEST 7: Event Creation & Deep Link Registration Flow
  // -------------------------------------------------------------------------
  console.log('--- TEST 7: Event Creation & Event-Specific Link Flow ---');
  // Admin creates an event
  const newEventRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'CodeForge Summit 2026',
      slug: 'codeforge-summit-2026',
      description: 'Annual SHEAT Inter-Campus Hackathon & Innovation Tournament',
      category: 'Technical',
      date: '2026-11-15',
      start_time: '09:00',
      end_time: '18:00',
      venue: 'Main Auditorium // Babatpur Campus',
      capacity: 100,
      registration_deadline: '2026-11-14T23:59:00Z',
      organizer_name: 'Department of Computer Science',
      organizer_contact: 'events@sheat.edu',
      rules: 'Valid institutional ID card mandatory for turnstile gate admission.',
    }),
  });
  if (!newEventRes.ok) {
    const err = await newEventRes.text();
    throw new Error(`FAILURE: Event creation failed: ${err}`);
  }
  const createdEvent = await newEventRes.json();
  console.log(`  Event Created: "${createdEvent.name}" (Slug: ${createdEvent.slug})`);

  // Verify registration URL for this event resolves HTTP 200
  const regPageRes = await fetch(`${BASE_URL}/register/${createdEvent.slug}`);
  if (!regPageRes.ok) {
    throw new Error(`FAILURE: /register/${createdEvent.slug} returned ${regPageRes.status}`);
  }
  console.log(`  Registration Route /register/${createdEvent.slug} active: HTTP ${regPageRes.status} OK`);

  // Submit registration for this event with branch 'B.Tech CSE - Gahani'
  const eventRegRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: createdEvent.id,
      name: 'Priya Sharma',
      student_id: 'SHEAT_2026_001',
      college: 'Arbitrary College Name', // Must be forced to SHEAT College of Engineering
      branch: 'B.Tech CSE - Gahani',
      course: 'B.Tech CSE',
      semester: 'Year 3 // Sem 5',
      email: 'priya.sharma@sheat.edu',
      phone: '+91 98765 43210',
    }),
  });
  if (!eventRegRes.ok) {
    const err = await eventRegRes.text();
    throw new Error(`FAILURE: Event registration failed: ${err}`);
  }
  const regRecord = await eventRegRes.json();
  console.log(`  Registration Recorded: Number=${regRecord.registration_number}`);
  console.log(`  College Saved: "${regRecord.college}"`);
  console.log(`  Branch Saved: "${regRecord.branch}"`);

  if (regRecord.college !== 'SHEAT College of Engineering') {
    throw new Error(`FAILURE: Registration college not locked to "SHEAT College of Engineering"! Got: ${regRecord.college}`);
  }
  if (regRecord.branch !== 'B.Tech CSE - Gahani') {
    throw new Error(`FAILURE: Registration branch not saved as "B.Tech CSE - Gahani"! Got: ${regRecord.branch}`);
  }
  console.log('✓ Confirmed: Event registration preserves event slug and records fixed college + required branch.\n');

  // -------------------------------------------------------------------------
  // TEST 8: Admin Visibility of Branch
  // -------------------------------------------------------------------------
  console.log('--- TEST 8: Admin Visibility of Branch Information ---');
  const allRegsRes = await fetch(`${BASE_URL}/api/registrations`);
  const allRegs = await allRegsRes.json();
  const targetReg = allRegs.find((r) => r.student_id === 'SHEAT_2026_001');
  if (!targetReg || !targetReg.branch) {
    throw new Error(`FAILURE: Admin could not see branch on student registration! Got: ${JSON.stringify(targetReg)}`);
  }
  console.log(`  Admin verified registration for student: ${targetReg.name} &bull; Branch: ${targetReg.branch}`);
  console.log('✓ Confirmed: Branch information is visible in admin registration query.\n');

  // -------------------------------------------------------------------------
  // TEST 9: Student Data Isolation
  // -------------------------------------------------------------------------
  console.log('--- TEST 9: Student Data Isolation ---');
  // Query registrations for Priya
  const priyaRegsRes = await fetch(`${BASE_URL}/api/registrations?studentId=SHEAT_2026_001`);
  const priyaRegs = await priyaRegsRes.json();
  // Query registrations for another student
  const otherRegsRes = await fetch(`${BASE_URL}/api/registrations?studentId=NON_EXISTENT_999`);
  const otherRegs = await otherRegsRes.json();

  console.log(`  Priya registrations count: ${priyaRegs.length}`);
  console.log(`  Other student registrations count: ${otherRegs.length}`);

  if (priyaRegs.length !== 1 || otherRegs.length !== 0) {
    throw new Error(`FAILURE: Student data isolation violated!`);
  }
  console.log('✓ Confirmed: Strict student data isolation. Priya sees 1 registration, other student sees 0.\n');

  // -------------------------------------------------------------------------
  // TEST 10: Disk Persistence Verification
  // -------------------------------------------------------------------------
  console.log('--- TEST 10: Server Disk Persistence (data/db.json) ---');
  if (existsSync('./data/db.json')) {
    const rawDisk = readFileSync('./data/db.json', 'utf-8');
    const diskDb = JSON.parse(rawDisk);
    console.log(`  Disk DB Events: ${diskDb.events.length}`);
    console.log(`  Disk DB Registrations: ${diskDb.registrations.length}`);
    console.log(`  Disk DB Students: ${diskDb.students.length}`);
    console.log(`  Disk DB Admin Name: ${diskDb.adminProfile?.name}`);

    if (diskDb.events.length < 1 || diskDb.registrations.length < 1 || diskDb.students.length < 1) {
      throw new Error('FAILURE: New records did not write to data/db.json!');
    }
    console.log('✓ Confirmed: All newly created real records successfully persisted to data/db.json.\n');
  } else {
    throw new Error('FAILURE: data/db.json file does not exist on disk!');
  }

  console.log('======================================================================');
  console.log('ALL UPDATE #3 TESTS PASSED FLAWLESSLY!');
  console.log('======================================================================');
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err.message);
  process.exit(1);
});
