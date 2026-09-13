const BASE = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('CAMPUS PULSE — GET PASS & CLEAN PRODUCTION TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Verify Zero Demo Data
  console.log('--- TEST 1: VERIFY DEMO DATA REMOVAL ---');
  const evRes = await fetch(`${BASE}/api/events`);
  const events = await evRes.json();
  console.log(`Active Events Count: ${events.length}`);
  const demoEvents = events.filter(e => 
    e.slug === 'technova-2026' || e.slug === 'aurora-2026' || e.slug === 'robowars-2026' || e.slug === 'esummit-2026'
  );
  if (demoEvents.length > 0) {
    console.error('FAIL: Found demo events in API output:', demoEvents.map(e => e.slug));
    process.exit(1);
  }
  console.log('PASS: Zero demo events present in API response.\n');

  // Test 2: Student Login
  console.log('--- TEST 2: STUDENT AUTHENTICATION ---');
  const loginRes = await fetch(`${BASE}/api/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: '2503840100024',
      password: 'password123',
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.error('FAIL: Student login failed:', loginData);
    process.exit(1);
  }
  console.log(`PASS: Student authenticated as ${loginData.student.name} (${loginData.student.student_id})\n`);

  // Test 3: Get or Create Event for testing
  console.log('--- TEST 3: EVENT AVAILABILITY ---');
  let targetEvent = events[0];
  if (!targetEvent) {
    console.log('No existing event, creating one via Admin API...');
    const createEvRes = await fetch(`${BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Engineer’s Day 2026',
        slug: 'engineers-day-2026',
        category: 'Technical',
        date: '2026-10-24',
        start_time: '09:00',
        end_time: '18:00',
        venue: 'Main Auditorium',
        capacity: 100,
        organizer_name: 'Dean of Student Affairs',
        organizer_contact: 'events@sheat.edu',
        status: 'OPEN',
      }),
    });
    targetEvent = await createEvRes.json();
    console.log(`Created test event: ${targetEvent.name} (${targetEvent.slug})`);
  } else {
    console.log(`Using existing event: ${targetEvent.name} (${targetEvent.slug})`);
  }
  console.log('PASS: Event ready for testing.\n');

  // Test 4: Get Pass Flow (/api/events/get-pass)
  console.log('--- TEST 4: GET PASS FLOW ---');
  const getPassRes = await fetch(`${BASE}/api/events/get-pass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: targetEvent.slug || targetEvent.id,
      student_id: loginData.student.student_id,
      student: loginData.student,
    }),
  });
  const passData = await getPassRes.json();
  if (!getPassRes.ok || !passData.access_token) {
    console.error('FAIL: Get Pass failed:', passData);
    process.exit(1);
  }
  console.log(`PASS: Valid Pass Token Generated / Retrieved: ${passData.pass_token}`);
  console.log(`PASS: Valid Access Token: ${passData.access_token}`);
  console.log(`PASS: Redirect URL: ${passData.redirect_url}\n`);

  // Test 5: Verify Token Lookup API (/api/registrations?token=...)
  console.log('--- TEST 5: TOKEN LOOKUP API RESOLUTION ---');
  const lookupRes = await fetch(`${BASE}/api/registrations?token=${encodeURIComponent(passData.access_token)}`);
  const lookupData = await lookupRes.json();
  if (!lookupRes.ok || !lookupData.id) {
    console.error('FAIL: Token lookup failed:', lookupData);
    process.exit(1);
  }
  console.log(`PASS: Token resolves to registration ${lookupData.id} for ${lookupData.name}`);
  console.log(`PASS: Status is ${lookupData.status}, Pass Token is ${lookupData.pass_token}\n`);

  // Test 6: Verify Pass Page HTTP Status (/registration-status/[access_token])
  console.log('--- TEST 6: PASS PAGE HTTP RESOLUTION ---');
  const pageRes = await fetch(`${BASE}/registration-status/${passData.access_token}`);
  if (!pageRes.ok) {
    console.error('FAIL: Pass page returned HTTP', pageRes.status);
    process.exit(1);
  }
  console.log(`PASS: Pass page returned HTTP ${pageRes.status}\n`);

  // Test 7: Verify Idempotence (Calling Get Pass again reuses valid token)
  console.log('--- TEST 7: IDEMPOTENT GET PASS REUSE ---');
  const secondPassRes = await fetch(`${BASE}/api/events/get-pass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: targetEvent.slug || targetEvent.id,
      student_id: loginData.student.student_id,
    }),
  });
  const secondPassData = await secondPassRes.json();
  if (secondPassData.access_token !== passData.access_token) {
    console.error('FAIL: Expected reused access_token, got new token');
    process.exit(1);
  }
  console.log('PASS: Reused existing valid pass token without recreation.\n');

  // Test 8: Create New Event and New Student Registration
  console.log('--- TEST 8: NEW EVENT & NEW REGISTRATION GET PASS FLOW ---');
  const newEventSlug = `ai-hackathon-${Date.now().toString(36)}`;
  const createNewEvRes = await fetch(`${BASE}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'AI Innovation Hackathon',
      slug: newEventSlug,
      category: 'Technical',
      date: '2026-11-15',
      start_time: '10:00',
      end_time: '20:00',
      venue: 'Computer Science Lab 01',
      capacity: 50,
      organizer_name: 'CSE Department',
      organizer_contact: 'cse@sheat.edu',
      status: 'OPEN',
    }),
  });
  const newEvent = await createNewEvRes.json();
  console.log(`Created new event: ${newEvent.name} (${newEvent.slug})`);

  const newPassRes = await fetch(`${BASE}/api/events/get-pass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: newEvent.slug,
      student_id: loginData.student.student_id,
      student: loginData.student,
    }),
  });
  const newPassData = await newPassRes.json();
  if (!newPassRes.ok || !newPassData.access_token) {
    console.error('FAIL: Get Pass for newly created event failed:', newPassData);
    process.exit(1);
  }
  console.log(`PASS: New event pass token: ${newPassData.pass_token}`);
  console.log(`PASS: New event access token: ${newPassData.access_token}`);

  const newLookupRes = await fetch(`${BASE}/api/registrations?token=${encodeURIComponent(newPassData.access_token)}`);
  const newLookupData = await newLookupRes.json();
  if (!newLookupRes.ok || newLookupData.access_token !== newPassData.access_token) {
    console.error('FAIL: Failed to resolve new event pass token:', newLookupData);
    process.exit(1);
  }
  console.log(`PASS: Successfully verified pass token for newly created event: ${newLookupData.event_name}`);

  console.log('\n====================================================');
  console.log('ALL TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('UNEXPECTED TEST ERROR:', err);
  process.exit(1);
});
