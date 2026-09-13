import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return response;
}

async function runPhase3Tests() {
  console.log('======================================================================');
  console.log('STARTING PHASE 3 PRESENTATION & DEMO FLOW VALIDATION');
  console.log('======================================================================\n');

  // Test 1: Navigation & Route Accessibility
  console.log('Step 1: Validating all 14 Core Presentation Routes...');
  const routesToTest = [
    // Admin Routes
    { path: '/admin', name: 'Admin Command Center' },
    { path: '/admin/events', name: 'Admin Events Registry' },
    { path: '/admin/events/create', name: 'Admin Event Creation' },
    { path: '/admin/registrations', name: 'Admin Registrations' },
    { path: '/admin/verification', name: 'Admin Verification Queue' },
    { path: '/admin/scanner', name: 'Turnstile Scanner Station' },
    { path: '/admin/attendance', name: 'Attendance & Telemetry' },
    { path: '/admin/certificates', name: 'Certificates Issuance Hub' },
    // Student Routes
    { path: '/', name: 'Student Home Page' },
    { path: '/events', name: 'Events Discovery' },
    { path: '/my-events', name: 'My Events' },
    { path: '/my-passes', name: 'My Passes' },
    { path: '/certificates', name: 'Student Certificates Vault' },
    { path: '/profile', name: 'Student Academic Profile' },
  ];

  for (const r of routesToTest) {
    const res = await request(r.path);
    assert.strictEqual(res.status, 200, `Route ${r.path} failed with HTTP ${res.status}`);
    console.log(`  ✓ Route ${r.path.padEnd(24)} (${r.name}): HTTP 200 OK`);
  }

  // Test 2: Admin creates a showcase event
  console.log('\nStep 2: Admin publishes showcase event via /api/events...');
  const eventPayload = {
    slug: `ai-summit-${Date.now()}`,
    name: 'National AI & Robotics Summit 2026',
    description: 'Premier collegiate exhibition of autonomous systems and neural network architectures.',
    category: 'Technical',
    date: '2026-11-28',
    start_time: '10:00',
    end_time: '18:00',
    venue: 'Auditorium Alpha // Robotics Wing',
    capacity: 100,
    registration_deadline: '2026-11-26T23:59:00Z',
    organizer_name: 'AI Club & Robotics Society',
    organizer_contact: 'ai-club@campus.edu',
    eligibility: 'All collegiate STEM scholars',
    rules: 'Digital QR Pass strictly required for entrance turnstiles.',
    status: 'OPEN',
    event_status: 'UPCOMING',
  };

  const createEventRes = await request('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventPayload),
  });
  assert.strictEqual(createEventRes.status, 201, 'Failed to create event');
  const event = await createEventRes.json();
  console.log(`  ✓ Event Published: "${event.name}" [ID: ${event.id}, Slug: ${event.slug}]`);

  // Test 3: Verify dynamic public registration page exists
  console.log(`\nStep 3: Checking registration link for /register/${event.slug}...`);
  const regPageRes = await request(`/register/${event.slug}`);
  assert.strictEqual(regPageRes.status, 200, 'Registration page failed to load');
  console.log(`  ✓ Public registration URL active: ${BASE_URL}/register/${event.slug}`);

  // Test 4: Student registers for event
  console.log('\nStep 4: Submitting student registration...');
  const regPayload = {
    event_id: event.id,
    name: 'Seraphina Vance',
    student_id: `STU-2024-${Math.floor(1000 + Math.random() * 9000)}`,
    college: 'SHEAT College of Engineering',
    course: 'B.Tech Artificial Intelligence',
    semester: 'Year 3 // Sem 5',
    email: `seraphina.${Date.now()}@campus.edu`,
    phone: '+1 (555) 018-7744',
  };

  const submitRegRes = await request('/api/registrations', {
    method: 'POST',
    body: JSON.stringify(regPayload),
  });
  assert.strictEqual(submitRegRes.status, 201, 'Failed to submit registration');
  const regData = await submitRegRes.json();
  assert.strictEqual(regData.status, 'PENDING');
  console.log(`  ✓ Registration Received: ${regData.registration_number}`);
  console.log(`  ✓ Access Token: ${regData.access_token}`);
  console.log(`  ✓ Private Tracker URL: ${BASE_URL}/registration-status/${regData.access_token}`);

  // Test 5: Verify zero-login status page resolves
  console.log('\nStep 5: Verifying zero-login private status tracker...');
  const statusPageRes = await request(`/registration-status/${regData.access_token}`);
  assert.strictEqual(statusPageRes.status, 200, 'Status tracker failed to load');
  console.log(`  ✓ Status tracker loads cleanly without login requirement.`);

  // Test 6: Admin approves registration in verification queue
  console.log('\nStep 6: Admin approves candidate via /api/registrations/verify...');
  const verifyRes = await request('/api/registrations/verify', {
    method: 'POST',
    body: JSON.stringify({ registration_id: regData.id }),
  });
  assert.strictEqual(verifyRes.status, 200, 'Failed to verify registration');
  const verifiedReg = await verifyRes.json();
  assert.strictEqual(verifiedReg.status, 'VERIFIED');
  assert.ok(verifiedReg.pass_token, 'Pass token missing from verified registration');
  console.log(`  ✓ Candidate Verified! Generated Pass ID: ${verifiedReg.pass_token}`);

  // Test 7: Scanner validates digital pass at turnstile
  console.log('\nStep 7: Validating pass at turnstile gate via /api/scanner/validate...');
  const scan1Res = await request('/api/scanner/validate', {
    method: 'POST',
    body: JSON.stringify({
      pass_token: verifiedReg.pass_token,
      event_id: event.slug,
      gate: 'Gate 02 - Main Atrium',
    }),
  });
  assert.strictEqual(scan1Res.status, 200);
  const scan1Data = await scan1Res.json();
  assert.strictEqual(scan1Data.status, 'VALID');
  console.log(`  ✓ Scan Result: ${scan1Data.status} - ${scan1Data.message}`);

  // Test 8: Scanner rejects duplicate scan
  console.log('\nStep 8: Testing turnstile duplicate protection on re-scan...');
  const scan2Res = await request('/api/scanner/validate', {
    method: 'POST',
    body: JSON.stringify({
      pass_token: verifiedReg.pass_token,
      event_id: event.slug,
      gate: 'Gate 02 - Main Atrium',
    }),
  });
  assert.strictEqual(scan2Res.status, 200);
  const scan2Data = await scan2Res.json();
  assert.strictEqual(scan2Data.status, 'DUPLICATE');
  console.log(`  ✓ Duplicate Intercepted: ${scan2Data.status} - Barrier locked.`);

  // Test 9: Scanner rejects pass on wrong event
  console.log('\nStep 9: Testing scanner wrong event protection...');
  const wrongEventRes = await request('/api/scanner/validate', {
    method: 'POST',
    body: JSON.stringify({
      pass_token: verifiedReg.pass_token,
      event_id: 'technova-2026', // Different event
      gate: 'Gate 01',
    }),
  });
  assert.strictEqual(wrongEventRes.status, 200);
  const wrongEventData = await wrongEventRes.json();
  assert.strictEqual(wrongEventData.status, 'WRONG_EVENT');
  console.log(`  ✓ Wrong Event Intercepted: ${wrongEventData.status} - ${wrongEventData.message}`);

  // Test 10: Attendance telemetry reflects turnstile check-in
  console.log('\nStep 10: Verifying attendance telemetry for event...');
  const attListRes = await request(`/api/attendance?event_id=${event.id}`);
  assert.strictEqual(attListRes.status, 200);
  const attList = await attListRes.json();
  const checkedInAttendee = attList.find((a) => a.id === regData.id);
  assert.ok(checkedInAttendee, 'Attendee not found in attendance roster');
  assert.strictEqual(checkedInAttendee.checked_in, true);
  console.log(`  ✓ Confirmed on-premise attendance: ${checkedInAttendee.name} (${checkedInAttendee.gate})`);

  // Test 11: Issue Certificate for event
  console.log('\nStep 11: Dispatching certificate for attended student...');
  const issueCertRes = await request('/api/certificates', {
    method: 'POST',
    body: JSON.stringify({ event_id: event.id }),
  });
  assert.strictEqual(issueCertRes.status, 200);
  const certResult = await issueCertRes.json();
  console.log(`  ✓ Certificates issued count: ${certResult.issued_count}`);

  // Test 12: Certificates Vault contains newly issued credential
  console.log('\nStep 12: Checking certificates vault...');
  const certsRes = await request('/api/certificates');
  assert.strictEqual(certsRes.status, 200);
  const allCerts = await certsRes.json();
  const studentCert = allCerts.find((c) => c.registration_id === regData.id);
  assert.ok(studentCert, 'Student certificate not found in certificates registry');
  console.log(`  ✓ Certificate Confirmed: ${studentCert.certificate_number} for ${studentCert.student_name}`);

  console.log('\n======================================================================');
  console.log('ALL PHASE 3 PRESENTATION & DEMO FLOW TESTS COMPLETED SUCCESSFULLY!');
  console.log('======================================================================\n');
}

runPhase3Tests().catch((err) => {
  console.error('\n❌ PHASE 3 TEST FAILURE:', err);
  process.exit(1);
});
