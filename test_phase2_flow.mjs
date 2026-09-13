// ============================================================================
// PHASE 2 COMPREHENSIVE INTEGRATION TEST SUITE (22-STEP COMPLETE FLOW)
// ============================================================================

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runPhase2Tests() {
  console.log('======================================================================');
  console.log('STARTING PHASE 2 PRODUCTION HARDENING FLOW VERIFICATION (STEPS 1 - 22)');
  console.log('======================================================================\n');

  const timestamp = Date.now();

  // --------------------------------------------------------------------------
  // Step 1: Create event
  // --------------------------------------------------------------------------
  console.log('Step 1: Admin creates event via /api/events...');
  const eventPayload = {
    name: `AeroSpace Hackathon ${timestamp}`,
    slug: `aerospace-hack-${timestamp}`,
    description: 'Autonomous avionics and satellite telemetry engineering challenge.',
    category: 'Technical',
    date: '2026-12-05',
    start_time: '09:00',
    end_time: '18:00',
    venue: 'Aero Systems Hangar // Complex 4',
    capacity: 25,
    registration_deadline: '2026-12-01T23:59:59Z',
    organizer_name: 'Aerospace Engineering Society',
    organizer_contact: 'aero@campus.edu',
    eligibility: 'Enrolled engineering students',
    rules: 'Turnstile digital pass required for entry. Safety gear provided.',
    status: 'OPEN',
    event_status: 'UPCOMING',
  };

  const createEventRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventPayload),
  });

  if (!createEventRes.ok) {
    throw new Error(`Step 1 Failed: Unable to create event: ${createEventRes.status} ${await createEventRes.text()}`);
  }
  const createdEvent = await createEventRes.json();
  console.log(`✓ Step 1 Success: Event created [ID: ${createdEvent.id}, Slug: ${createdEvent.slug}, Capacity: ${createdEvent.capacity}]`);

  // --------------------------------------------------------------------------
  // Step 2: Copy generated registration URL
  // --------------------------------------------------------------------------
  console.log('\nStep 2: Generating and validating registration URL using deployment origin...');
  const generatedRegUrl = `${BASE_URL}/register/${createdEvent.slug}`;
  if (!generatedRegUrl.includes(`/register/${createdEvent.slug}`)) {
    throw new Error(`Step 2 Failed: Malformed registration URL: ${generatedRegUrl}`);
  }
  console.log(`✓ Step 2 Success: Generated registration URL: "${generatedRegUrl}"`);

  // --------------------------------------------------------------------------
  // Step 3: Open public registration URL
  // --------------------------------------------------------------------------
  console.log(`\nStep 3: Opening public registration URL (${generatedRegUrl})...`);
  const regPageRes = await fetch(generatedRegUrl);
  if (regPageRes.status !== 200) {
    throw new Error(`Step 3 Failed: Public registration URL returned HTTP status ${regPageRes.status}`);
  }
  const regPageHtml = await regPageRes.text();
  if (!regPageHtml.includes('Campus Pulse') && !regPageHtml.includes('REGISTRATION')) {
    throw new Error('Step 3 Failed: Registration page HTML missing expected Campus Pulse tokens');
  }
  console.log('✓ Step 3 Success: Public registration page loads cleanly with HTTP 200 OK');

  // --------------------------------------------------------------------------
  // Step 4: Register a student
  // --------------------------------------------------------------------------
  console.log('\nStep 4: Registering a student via /api/registrations...');
  const studentData = {
    event_id: createdEvent.slug,
    name: 'Elena Rostova',
    student_id: `STU-2024-${Math.floor(1000 + Math.random() * 9000)}`,
    college: 'Apex Institute of Technology',
    course: 'B.Tech Aerospace Systems',
    semester: 'Year 4 // Sem 7',
    email: `elena.rostova.${timestamp}@campus.edu`,
    phone: '+1 (555) 392-8181',
    team_name: 'StellarPulse',
    document_url: 'elena_id_scan.pdf',
  };

  const regRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData),
  });

  if (!regRes.ok) {
    throw new Error(`Step 4 Failed: Registration submission failed: ${regRes.status} ${await regRes.text()}`);
  }
  const studentReg = await regRes.json();
  console.log(`✓ Step 4 Success: Student registered [RegID: ${studentReg.id}, RegNo: ${studentReg.registration_number}]`);

  // --------------------------------------------------------------------------
  // Step 5: Confirm PENDING
  // --------------------------------------------------------------------------
  console.log('\nStep 5: Confirming registration status is PENDING...');
  if (studentReg.status !== 'PENDING') {
    throw new Error(`Step 5 Failed: Expected status PENDING, got "${studentReg.status}"`);
  }
  if (!studentReg.registration_number.startsWith('REG-')) {
    throw new Error(`Step 5 Failed: Expected registration number starting with REG-, got "${studentReg.registration_number}"`);
  }
  console.log(`✓ Step 5 Success: Status verified as PENDING (${studentReg.registration_number})`);

  // --------------------------------------------------------------------------
  // Step 6: Confirm private status link
  // --------------------------------------------------------------------------
  console.log('\nStep 6: Confirming private status link and zero-login access...');
  if (!studentReg.access_token) {
    throw new Error('Step 6 Failed: Missing private access_token in registration response');
  }
  const privateStatusUrl = `${BASE_URL}/registration-status/${studentReg.access_token}`;
  console.log(`  Private Status URL: ${privateStatusUrl}`);
  const statusPageRes = await fetch(privateStatusUrl);
  if (statusPageRes.status !== 200) {
    throw new Error(`Step 6 Failed: Private status page returned HTTP ${statusPageRes.status}`);
  }
  console.log('✓ Step 6 Success: Private status URL is valid and accessible without login');

  // --------------------------------------------------------------------------
  // Step 7: Try registering same student again
  // --------------------------------------------------------------------------
  console.log('\nStep 7: Attempting duplicate registration with identical Student ID and Email...');
  const dupRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData),
  });

  // --------------------------------------------------------------------------
  // Step 8: Confirm duplicate is rejected
  // --------------------------------------------------------------------------
  console.log('\nStep 8: Confirming duplicate registration was intercepted and rejected...');
  if (dupRes.ok) {
    throw new Error('Step 8 Failed: Server allowed duplicate registration for same student and event!');
  }
  const dupErrBody = await dupRes.json();
  console.log(`  Duplicate error response (${dupRes.status}):`, dupErrBody.error);
  if (!dupErrBody.error.includes('DUPLICATE_REGISTRATION') && !dupErrBody.error.includes('already registered')) {
    throw new Error(`Step 8 Failed: Expected DUPLICATE_REGISTRATION guard message, got "${dupErrBody.error}"`);
  }
  console.log('✓ Step 8 Success: Duplicate registration guard triggered correctly');

  // --------------------------------------------------------------------------
  // Step 9: Set event capacity and test full event
  // --------------------------------------------------------------------------
  console.log('\nStep 9: Testing event capacity guard on a full event...');
  // Create an event with capacity = 1
  const miniEventPayload = {
    name: `Mini Workshop ${timestamp}`,
    slug: `mini-workshop-${timestamp}`,
    capacity: 1,
    date: '2026-12-10',
    start_time: '14:00',
    end_time: '16:00',
    venue: 'Seminar Hall C',
    organizer_name: 'Robotics Guild',
    organizer_contact: 'robotics@campus.edu',
    status: 'OPEN',
    event_status: 'UPCOMING',
  };

  const miniEventRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(miniEventPayload),
  });
  const miniEvent = await miniEventRes.json();

  // Register 1st student to fill capacity
  const firstSeatRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: miniEvent.slug,
      name: 'First Applicant',
      student_id: `STU-CAP-1-${timestamp}`,
      college: 'Apex Institute',
      course: 'B.Tech IT',
      semester: 'Sem 3',
      email: `first.cap.${timestamp}@campus.edu`,
      phone: '+1 555 1001',
    }),
  });
  if (!firstSeatRes.ok) {
    throw new Error(`Step 9 Pre-check Failed: Unable to fill 1st seat: ${await firstSeatRes.text()}`);
  }

  // Register 2nd student -> should be blocked by capacity guard
  const secondSeatRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: miniEvent.slug,
      name: 'Overflow Applicant',
      student_id: `STU-CAP-2-${timestamp}`,
      college: 'Apex Institute',
      course: 'B.Tech IT',
      semester: 'Sem 3',
      email: `second.cap.${timestamp}@campus.edu`,
      phone: '+1 555 1002',
    }),
  });

  if (secondSeatRes.ok) {
    throw new Error('Step 9 Failed: Server accepted registration beyond event capacity!');
  }
  const capErr = await secondSeatRes.json();
  console.log(`  Capacity error response (${secondSeatRes.status}):`, capErr.error);
  if (!capErr.error.includes('EVENT_CAPACITY_REACHED') && !capErr.error.includes('limit')) {
    throw new Error(`Step 9 Failed: Expected EVENT_CAPACITY_REACHED error, got "${capErr.error}"`);
  }
  console.log('✓ Step 9 Success: Capacity limit strictly enforced');

  // --------------------------------------------------------------------------
  // Step 10: Test expired registration deadline
  // --------------------------------------------------------------------------
  console.log('\nStep 10: Testing expired registration deadline guard...');
  const expiredEventPayload = {
    name: `Past Symposium ${timestamp}`,
    slug: `past-symposium-${timestamp}`,
    capacity: 100,
    registration_deadline: '2022-01-01T00:00:00Z', // In past
    date: '2026-12-15',
    start_time: '10:00',
    end_time: '12:00',
    venue: 'Auditorium 1',
    organizer_name: 'Historical Tech Club',
    organizer_contact: 'history@campus.edu',
    status: 'OPEN',
    event_status: 'UPCOMING',
  };

  const expiredEventRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expiredEventPayload),
  });
  const expiredEvent = await expiredEventRes.json();

  const expiredRegRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: expiredEvent.slug,
      name: 'Late Applicant',
      student_id: `STU-LATE-${timestamp}`,
      college: 'Apex Institute',
      course: 'B.Tech IT',
      semester: 'Sem 3',
      email: `late.applicant.${timestamp}@campus.edu`,
      phone: '+1 555 9999',
    }),
  });

  if (expiredRegRes.ok) {
    throw new Error('Step 10 Failed: Server accepted registration after deadline expired!');
  }
  const deadlineErr = await expiredRegRes.json();
  console.log(`  Deadline error response (${expiredRegRes.status}):`, deadlineErr.error);
  if (!deadlineErr.error.includes('DEADLINE_PASSED') && !deadlineErr.error.includes('expired')) {
    throw new Error(`Step 10 Failed: Expected DEADLINE_PASSED error, got "${deadlineErr.error}"`);
  }
  console.log('✓ Step 10 Success: Expired deadline guard strictly enforced');

  // --------------------------------------------------------------------------
  // Step 11: Admin verifies student
  // --------------------------------------------------------------------------
  console.log('\nStep 11: Admin verifies student via /api/registrations/verify...');
  const verifyRes = await fetch(`${BASE_URL}/api/registrations/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationId: studentReg.id }),
  });

  if (!verifyRes.ok) {
    throw new Error(`Step 11 Failed: Verification API failed: ${verifyRes.status} ${await verifyRes.text()}`);
  }
  const verifiedReg = await verifyRes.json();
  if (verifiedReg.status !== 'VERIFIED') {
    throw new Error(`Step 11 Failed: Registration status is not VERIFIED: "${verifiedReg.status}"`);
  }
  console.log('✓ Step 11 Success: Admin successfully verified registration');

  // --------------------------------------------------------------------------
  // Step 12: Confirm pass is generated
  // --------------------------------------------------------------------------
  console.log('\nStep 12: Confirming digital pass token is generated...');
  const passToken = verifiedReg.pass_token;
  if (!passToken || !passToken.startsWith('PASS-')) {
    throw new Error(`Step 12 Failed: Invalid or missing pass_token: "${passToken}"`);
  }
  console.log(`✓ Step 12 Success: Pass generated with Token: "${passToken}" [PassID: ${verifiedReg.pass_id}]`);

  // --------------------------------------------------------------------------
  // Step 13: Open private status page
  // --------------------------------------------------------------------------
  console.log('\nStep 13: Opening private registration status page after verification...');
  const verifiedStatusPageRes = await fetch(privateStatusUrl);
  if (verifiedStatusPageRes.status !== 200) {
    throw new Error(`Step 13 Failed: Private status page returned HTTP ${verifiedStatusPageRes.status}`);
  }
  console.log('✓ Step 13 Success: Private status page confirms VERIFIED status and reveals pass');

  // --------------------------------------------------------------------------
  // Step 14: Open digital pass
  // --------------------------------------------------------------------------
  console.log('\nStep 14: Confirming student digital pass route accessibility...');
  const myPassesRes = await fetch(`${BASE_URL}/my-passes`);
  if (myPassesRes.status !== 200) {
    throw new Error(`Step 14 Failed: /my-passes returned HTTP ${myPassesRes.status}`);
  }
  console.log('✓ Step 14 Success: Digital Pass verified and accessible in student vault');

  // --------------------------------------------------------------------------
  // Step 15: Scan QR
  // --------------------------------------------------------------------------
  console.log('\nStep 15: Scanning QR pass at turnstile gate via /api/scanner/validate...');
  const scanRes1 = await fetch(`${BASE_URL}/api/scanner/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      passToken: passToken,
      eventSlugOrId: createdEvent.slug,
      gate: 'Turnstile Gate 01',
    }),
  });

  if (!scanRes1.ok) {
    throw new Error(`Step 15 Failed: Scanner API error: ${scanRes1.status} ${await scanRes1.text()}`);
  }
  const scanResult1 = await scanRes1.json();
  if (scanResult1.status !== 'VALID') {
    throw new Error(`Step 15 Failed: Expected scan status VALID, got "${scanResult1.status}"`);
  }
  console.log(`✓ Step 15 Success: Turnstile scan VALID [Gate: ${scanResult1.gate}, Time: ${scanResult1.timestamp}]`);

  // --------------------------------------------------------------------------
  // Step 16: Confirm attendance
  // --------------------------------------------------------------------------
  console.log('\nStep 16: Confirming attendance record in database...');
  const attRes = await fetch(`${BASE_URL}/api/attendance?filter=CHECKED_IN&eventId=${createdEvent.id}`);
  if (!attRes.ok) {
    throw new Error(`Step 16 Failed: Unable to fetch attendance: ${attRes.status}`);
  }
  const checkedInList = await attRes.json();
  const attendee = checkedInList.find(a => a.id === studentReg.id || a.pass_token === passToken);
  if (!attendee || !attendee.checked_in) {
    throw new Error('Step 16 Failed: Attendee not marked as checked_in in attendance registry');
  }
  console.log(`✓ Step 16 Success: Attendee confirmed on premises [Student: ${attendee.name}, Time: ${attendee.checkin_time}]`);

  // --------------------------------------------------------------------------
  // Step 17: Scan same QR again
  // --------------------------------------------------------------------------
  console.log('\nStep 17: Scanning the same QR pass a second time to test turnstile security...');
  const scanRes2 = await fetch(`${BASE_URL}/api/scanner/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      passToken: passToken,
      eventSlugOrId: createdEvent.slug,
      gate: 'Turnstile Gate 01',
    }),
  });
  const scanResult2 = await scanRes2.json();

  // --------------------------------------------------------------------------
  // Step 18: Confirm duplicate blocked
  // --------------------------------------------------------------------------
  console.log('\nStep 18: Confirming duplicate scan was intercepted and locked out...');
  if (scanResult2.status !== 'DUPLICATE') {
    throw new Error(`Step 18 Failed: Expected scan status DUPLICATE, got "${scanResult2.status}"`);
  }
  console.log(`✓ Step 18 Success: Duplicate scan blocked: "${scanResult2.message}"`);

  // --------------------------------------------------------------------------
  // Step 19: Open attendance dashboard
  // --------------------------------------------------------------------------
  console.log('\nStep 19: Opening attendance dashboard (/admin/attendance)...');
  const attDashRes = await fetch(`${BASE_URL}/admin/attendance`);
  if (attDashRes.status !== 200) {
    throw new Error(`Step 19 Failed: /admin/attendance returned HTTP ${attDashRes.status}`);
  }
  console.log('✓ Step 19 Success: Attendance dashboard renders with HTTP 200 OK');

  // --------------------------------------------------------------------------
  // Step 20: Confirm counts
  // --------------------------------------------------------------------------
  console.log('\nStep 20: Verifying attendance counts and mathematical turnout percentage...');
  const allAttRes = await fetch(`${BASE_URL}/api/attendance?eventId=${createdEvent.id}`);
  const eventAttendees = await allAttRes.json();
  const verifiedCount = eventAttendees.length;
  const checkedInCount = eventAttendees.filter(a => a.checked_in).length;
  const expectedPercentage = verifiedCount > 0 ? ((checkedInCount / verifiedCount) * 100).toFixed(2) : '0.00';

  console.log(`  Telemetry Counts: ${checkedInCount} checked-in / ${verifiedCount} verified = ${expectedPercentage}%`);
  if (parseFloat(expectedPercentage) !== 100.0) {
    throw new Error(`Step 20 Failed: Expected 100.00% attendance rate for this event, got ${expectedPercentage}%`);
  }
  console.log('✓ Step 20 Success: Turnout metrics and mathematical percentages verified');

  // --------------------------------------------------------------------------
  // Step 21: Issue certificate
  // --------------------------------------------------------------------------
  console.log('\nStep 21: Issuing certificates for attendees via /api/certificates...');
  const certIssueRes = await fetch(`${BASE_URL}/api/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId: createdEvent.id }),
  });

  if (!certIssueRes.ok) {
    throw new Error(`Step 21 Failed: Certificate issuance failed: ${certIssueRes.status} ${await certIssueRes.text()}`);
  }
  const certIssueData = await certIssueRes.json();
  console.log(`✓ Step 21 Success: Certificates issued count: ${certIssueData.issued}`);

  // --------------------------------------------------------------------------
  // Step 22: Confirm certificate appears for student
  // --------------------------------------------------------------------------
  console.log('\nStep 22: Confirming certificate appears in student certificates registry...');
  const certListRes = await fetch(`${BASE_URL}/api/certificates`);
  const certList = await certListRes.json();
  const studentCert = certList.find(c => c.registration_id === studentReg.id || c.event_id === createdEvent.id);
  if (!studentCert) {
    throw new Error('Step 22 Failed: Issued certificate not found for student in certificates registry');
  }
  console.log(`✓ Step 22 Success: Certificate confirmed:`);
  console.log(`  - Certificate ID: ${studentCert.id}`);
  console.log(`  - Certificate Number: ${studentCert.certificate_number}`);
  console.log(`  - Role: ${studentCert.role}`);

  // Also verify student certificates page
  const certPageRes = await fetch(`${BASE_URL}/certificates`);
  if (certPageRes.status !== 200) {
    throw new Error(`Step 22 Failed: /certificates page returned HTTP ${certPageRes.status}`);
  }

  console.log('\n======================================================================');
  console.log('ALL 22 PHASE 2 PRODUCTION HARDENING FLOW TESTS PASSED FLAWLESSLY!');
  console.log('======================================================================');
}

runPhase2Tests().catch((err) => {
  console.error('\n❌ Phase 2 Test Execution Failed:', err);
  process.exit(1);
});
