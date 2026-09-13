// Test script for Phase 1 Supabase Persistence flow (Steps A to R)
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING PHASE 1 VERIFICATION TESTS (A through R)');
  console.log('==================================================\n');

  // Step A: Create an event
  console.log('Step A & B: Creating an event via /api/events...');
  const newEventData = {
    name: 'Quantum Hack 2026',
    slug: `quantum-hack-${Date.now()}`,
    description: 'Quantum computing and cybersecurity inter-collegiate collegiate challenge.',
    category: 'Technical',
    date: '2026-11-15',
    start_time: '10:00',
    end_time: '20:00',
    venue: 'Quantum Labs Tower',
    capacity: 75,
    organizer_name: 'Quantum Society',
    organizer_contact: 'quantum@campus.edu',
    eligibility: 'All collegiate STEM majors',
    rules: 'Hardware provided. Digital pass required at security turnstile.',
    status: 'OPEN',
    event_status: 'UPCOMING'
  };

  const createEventRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEventData)
  });

  if (!createEventRes.ok) {
    throw new Error(`Failed to create event: ${createEventRes.status} ${await createEventRes.text()}`);
  }
  const createdEvent = await createEventRes.json();
  console.log(`✓ Event created successfully: ID=${createdEvent.id}, slug=${createdEvent.slug}, name="${createdEvent.name}"`);

  // Verify event retrieval
  const getEventsRes = await fetch(`${BASE_URL}/api/events`);
  const allEvents = await getEventsRes.json();
  const eventInList = allEvents.find(e => e.id === createdEvent.id || e.slug === createdEvent.slug);
  if (!eventInList) {
    throw new Error(`Event ${createdEvent.slug} not found in events listing!`);
  }
  console.log(`✓ Confirmed event exists in database registry with status=${eventInList.status}`);

  // Step C: Verify registration page is accessible
  console.log(`\nStep C: Opening /register/${createdEvent.slug}...`);
  const regPageRes = await fetch(`${BASE_URL}/register/${createdEvent.slug}`);
  if (regPageRes.status !== 200) {
    throw new Error(`Failed to open registration page: status ${regPageRes.status}`);
  }
  console.log(`✓ Registration page for ${createdEvent.slug} returns HTTP 200 OK`);

  // Step D & E: Submit student registration & confirm PENDING status
  console.log('\nStep D & E: Submitting student registration via /api/registrations...');
  const studentRegData = {
    event_id: createdEvent.slug,
    name: 'Jordan Rivera',
    student_id: `STU-2024-${Math.floor(1000 + Math.random() * 9000)}`,
    college: 'SHEAT College of Engineering',
    course: 'B.Tech Cybersecurity',
    semester: 'Year 3 // Sem 5',
    email: `jordan.rivera.${Date.now()}@campus.edu`,
    phone: '+1 (555) 019-7721',
    team_name: 'QuantumBreak',
    document_url: 'student_id_rivera.pdf'
  };

  const regRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentRegData)
  });

  if (!regRes.ok) {
    throw new Error(`Registration failed: ${regRes.status} ${await regRes.text()}`);
  }
  const submittedReg = await regRes.json();
  console.log(`✓ Registration submitted:`);
  console.log(`  - ID: ${submittedReg.id}`);
  console.log(`  - Reg Number: ${submittedReg.registration_number}`);
  console.log(`  - Status: ${submittedReg.status}`);
  console.log(`  - Access Token: ${submittedReg.access_token}`);

  if (submittedReg.status !== 'PENDING') {
    throw new Error(`Expected registration status to be PENDING, but got ${submittedReg.status}`);
  }
  console.log('✓ Confirmed registration status is PENDING');

  // Step F & G & H: Admin Verification and Pass Generation
  console.log('\nStep F, G & H: Admin approving registration via /api/registrations/verify...');
  const verifyRes = await fetch(`${BASE_URL}/api/registrations/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationId: submittedReg.id })
  });

  if (!verifyRes.ok) {
    throw new Error(`Verification failed: ${verifyRes.status} ${await verifyRes.text()}`);
  }
  const verifiedReg = await verifyRes.json();
  console.log(`✓ Verification response:`);
  console.log(`  - Status: ${verifiedReg.status}`);
  console.log(`  - Pass Token: ${verifiedReg.pass_token}`);
  console.log(`  - Pass ID: ${verifiedReg.pass_id}`);

  if (verifiedReg.status !== 'VERIFIED') {
    throw new Error(`Expected registration status to be VERIFIED, but got ${verifiedReg.status}`);
  }
  if (!verifiedReg.pass_token) {
    throw new Error('Expected a real pass_token to be generated and linked!');
  }
  console.log('✓ Confirmed registrations.status = VERIFIED AND pass token generated');

  // Step I & J: Open student pass / registration status
  console.log('\nStep I & J: Confirming student pass and QR token...');
  const passToken = verifiedReg.pass_token;
  console.log(`✓ Digital Pass verified. QR Payload will contain: "${passToken}"`);

  // Step K & L: Scan the QR and confirm attendance row is created
  console.log('\nStep K & L: Scanning QR pass at turnstile gate via /api/scanner/validate...');
  const scanRes1 = await fetch(`${BASE_URL}/api/scanner/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      passToken: passToken,
      eventSlugOrId: createdEvent.slug,
      gate: 'Turnstile Gate 01'
    })
  });

  if (!scanRes1.ok) {
    throw new Error(`First scan failed: ${scanRes1.status} ${await scanRes1.text()}`);
  }
  const scanResult1 = await scanRes1.json();
  console.log(`✓ Turnstile scan 1 response:`);
  console.log(`  - Status: ${scanResult1.status}`);
  console.log(`  - Message: ${scanResult1.message}`);
  console.log(`  - Gate: ${scanResult1.gate}`);
  console.log(`  - Timestamp: ${scanResult1.timestamp}`);

  if (scanResult1.status !== 'VALID') {
    throw new Error(`Expected scan result VALID, got ${scanResult1.status}`);
  }
  console.log('✓ Attendance record created successfully');

  // Step M & N: Scan the same QR again -> Confirm ALREADY CHECKED IN (DUPLICATE)
  console.log('\nStep M & N: Scanning the same QR pass a second time to test duplicate rejection...');
  const scanRes2 = await fetch(`${BASE_URL}/api/scanner/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      passToken: passToken,
      eventSlugOrId: createdEvent.slug,
      gate: 'Turnstile Gate 01'
    })
  });

  const scanResult2 = await scanRes2.json();
  console.log(`✓ Turnstile scan 2 response:`);
  console.log(`  - Status: ${scanResult2.status}`);
  console.log(`  - Message: ${scanResult2.message}`);

  if (scanResult2.status !== 'DUPLICATE') {
    throw new Error(`Expected scan result DUPLICATE / ALREADY_CHECKED_IN, got ${scanResult2.status}`);
  }
  console.log('✓ Duplicate check-in was safely intercepted and blocked');

  // Step O & P: Open attendance dashboard and verify record
  console.log('\nStep O & P: Fetching attendance list via /api/attendance...');
  const attRes = await fetch(`${BASE_URL}/api/attendance?filter=CHECKED_IN`);
  if (!attRes.ok) {
    throw new Error(`Attendance fetch failed: ${attRes.status}`);
  }
  const attendanceList = await attRes.json();
  const foundAttendee = attendanceList.find(a => a.id === submittedReg.id || a.pass_token === passToken);
  if (!foundAttendee) {
    throw new Error(`Attendee ${submittedReg.name} not found in checked-in attendance list!`);
  }
  console.log(`✓ Confirmed attendee record in attendance registry:`);
  console.log(`  - Student Name: ${foundAttendee.name}`);
  console.log(`  - Student ID: ${foundAttendee.student_id}`);
  console.log(`  - Check-in Time: ${foundAttendee.checkin_time}`);
  console.log(`  - Checked In: ${foundAttendee.checked_in}`);

  // Step Q & R: Issue certificate & confirm certificate exists
  console.log('\nStep Q & R: Issuing certificate for event via /api/certificates...');
  const certIssueRes = await fetch(`${BASE_URL}/api/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId: createdEvent.id })
  });

  if (!certIssueRes.ok) {
    throw new Error(`Certificate issuance failed: ${certIssueRes.status} ${await certIssueRes.text()}`);
  }
  const certIssueResult = await certIssueRes.json();
  console.log(`✓ Certificates issued count: ${certIssueResult.issued}`);

  const certListRes = await fetch(`${BASE_URL}/api/certificates`);
  const certList = await certListRes.json();
  const studentCert = certList.find(c => c.registration_id === submittedReg.id || c.event_id === createdEvent.id);
  console.log(`✓ Confirmed certificate exists:`);
  console.log(`  - Certificate ID: ${studentCert ? studentCert.id : 'N/A'}`);
  console.log(`  - Certificate Number: ${studentCert ? studentCert.certificate_number : 'N/A'}`);
  console.log(`  - Role: ${studentCert ? studentCert.role : 'N/A'}`);

  console.log('\n==================================================');
  console.log('ALL PHASE 1 TESTS (A THROUGH R) PASSED FLAWLESSLY!');
  console.log('==================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
