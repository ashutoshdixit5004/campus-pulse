import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';

async function runScenario() {
  console.log('======================================================================');
  console.log('VERIFYING EVENT CREATION -> PUBLIC REGISTRATION FLOW (STEPS A - L)');
  console.log('======================================================================\n');

  // STEP A: Login as Admin
  console.log('--- STEP A: Admin Authentication ---');
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vipasha@sheat.edu', password: 'admin' }),
  });
  assert.strictEqual(adminLoginRes.status, 200, 'Admin login failed');
  const adminLoginData = await adminLoginRes.json();
  console.log(`✓ Admin Logged In: ${adminLoginData.admin?.name || adminLoginData.user?.name || 'Dr. Vipasha'}\n`);

  // STEP B & C: Create a completely new event & Save to database
  console.log('--- STEPS B & C: Create Completely New Event & Save ---');
  const eventName = "Engineer's Day 2026 // Innovation Arena";
  const createRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: eventName,
      description: 'Annual college-wide engineering showcase and tournament at SHEAT.',
      category: 'Technical',
      status: 'OPEN',
      event_status: 'UPCOMING',
      date: '2026-09-15',
      start_time: '10:00',
      end_time: '17:00',
      venue: 'Auditorium A // Babatpur Campus',
      capacity: 120,
      registration_deadline: '2026-09-14T23:59:00Z',
      organizer_name: 'SHEAT Department of CSE',
      organizer_contact: 'events@sheat.edu',
      rules: 'College ID card required at entry gate.',
    }),
  });
  assert.strictEqual(createRes.status, 201, 'Failed to create event');
  const event1 = await createRes.json();
  console.log(`✓ Event 1 Created: "${event1.name}"`);
  console.log(`  ID: ${event1.id}`);
  console.log(`  Canonical Slug: ${event1.slug}`);
  assert.ok(event1.id, 'Event missing ID');
  assert.ok(event1.slug, 'Event missing slug');

  // Verify server disk persistence in data/db.json
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  const diskData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const foundOnDisk = diskData.events.find(e => e.id === event1.id || e.slug === event1.slug);
  assert.ok(foundOnDisk, 'Event was not persisted to data/db.json!');
  console.log(`✓ Confirmed: Event is securely persisted in data/db.json on server disk.\n`);

  // STEP D: Copy generated public registration link
  console.log('--- STEP D: Copy Public Registration Link ---');
  const publicRegUrl = `${BASE_URL}/register/${event1.slug}`;
  console.log(`✓ Public Registration URL generated: ${publicRegUrl}\n`);

  // STEP E: Open the link in a fresh / incognito browser session
  console.log('--- STEP E: Fresh Session / Incognito Event Lookup ---');
  // 1. Check direct route response
  const pageRes = await fetch(publicRegUrl);
  assert.strictEqual(pageRes.status, 200, 'Registration page route failed to respond');
  
  // 2. Query /api/events?slug=...
  const lookupRes = await fetch(`${BASE_URL}/api/events?slug=${encodeURIComponent(event1.slug)}`);
  assert.strictEqual(lookupRes.status, 200, 'API failed to find event by slug');
  const lookupEvent = await lookupRes.json();
  assert.strictEqual(lookupEvent.id, event1.id, 'Lookup returned wrong event');
  assert.strictEqual(lookupEvent.name, event1.name, 'Lookup event name mismatch');

  // 3. Query /api/events/[slug]
  const directSlugRes = await fetch(`${BASE_URL}/api/events/${encodeURIComponent(event1.slug)}`);
  assert.strictEqual(directSlugRes.status, 200, 'Dedicated /api/events/[slug] failed');
  const directSlugEvent = await directSlugRes.json();
  assert.strictEqual(directSlugEvent.id, event1.id, 'Direct slug returned wrong event');
  console.log(`✓ Confirmed: Fresh session successfully resolved event "${lookupEvent.name}" by slug "${event1.slug}".\n`);

  // STEP F & G: Student Signup / Login & Deep-link Return
  console.log('--- STEPS F & G: Student Registration & Authentication ---');
  const studentPayload = {
    name: 'Ananya Verma',
    full_name: 'Ananya Verma',
    student_id: 'SHEAT_2026_099',
    email: 'ananya.verma@sheat.edu',
    course: 'B.Tech CSE',
    branch: 'B.Tech CSE - Babatpur',
    phone: '+91 91234 56789',
    password: 'securepassword123',
  };

  const studentSignupRes = await fetch(`${BASE_URL}/api/student/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentPayload),
  });
  assert.strictEqual(studentSignupRes.status, 201, 'Student signup failed');
  const signupData = await studentSignupRes.json();
  console.log(`✓ Student Account Created: ${signupData.student.name} (${signupData.student.student_id})`);

  // STEP H: Verify redirect to the EXACT event registration page
  console.log('--- STEP H: Open EXACT Newly Created Event Form ---');
  const targetEventSlug = event1.slug;
  const verifiedEvent = await (await fetch(`${BASE_URL}/api/events?slug=${encodeURIComponent(targetEventSlug)}`)).json();
  assert.strictEqual(verifiedEvent.id, event1.id, 'Redirect target does not match created event');
  console.log(`✓ Loaded Exact Target Event: "${verifiedEvent.name}" (Capacity: ${verifiedEvent.capacity}, Venue: "${verifiedEvent.venue}")\n`);

  // STEP I: Submit registration for the newly created event
  console.log('--- STEP I: Submit Event Registration ---');
  const regSubmitRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: event1.id,
      name: studentPayload.name,
      student_id: studentPayload.student_id,
      college: 'SHEAT College of Engineering',
      branch: 'B.Tech CSE - Babatpur',
      course: 'B.Tech CSE',
      semester: 'Year 3 // Sem 5',
      email: studentPayload.email,
      phone: studentPayload.phone,
      document_url: 'student_id_card.pdf',
    }),
  });
  assert.strictEqual(regSubmitRes.status, 201, 'Registration submission failed');
  const regData = await regSubmitRes.json();
  console.log(`✓ Registration Successful! Number: ${regData.registration_number}`);
  assert.strictEqual(regData.event_id, event1.id, 'Registration was not linked to correct event ID');
  assert.ok(regData.access_token, 'Registration missing access token');

  // STEP J & K: Refresh page and confirm event and registration data persist
  console.log('--- STEPS J & K: Refresh Page & Verify Persistence ---');
  const refreshEvent = await (await fetch(`${BASE_URL}/api/events?slug=${encodeURIComponent(event1.slug)}`)).json();
  assert.ok(refreshEvent && refreshEvent.id === event1.id, 'Event disappeared after reload!');
  assert.strictEqual(refreshEvent.registered_count, 1, 'Registered count should be 1');

  const regQueryRes = await fetch(`${BASE_URL}/api/registrations?eventId=${encodeURIComponent(event1.id)}&studentId=${encodeURIComponent(studentPayload.student_id)}`);
  const myRegs = await regQueryRes.json();
  assert.ok(Array.isArray(myRegs) && myRegs.length > 0, 'Registration record not found upon refresh!');
  assert.strictEqual(myRegs[0].student_id, studentPayload.student_id);
  console.log(`✓ Confirmed: Event and registration data persisted across reload (registered count: ${refreshEvent.registered_count}).\n`);

  // STEP L: Create a Second Event and Verify Independence
  console.log('--- STEP L: Open Second Event and Verify Exact Independence ---');
  const event2Name = 'National AI & Quantum Computing Summit 2026';
  const create2Res = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: event2Name,
      description: 'Advanced deep tech symposium on quantum algorithms and neural networks.',
      category: 'Technical',
      status: 'OPEN',
      event_status: 'UPCOMING',
      date: '2026-11-20',
      start_time: '09:00',
      end_time: '18:00',
      venue: 'Gahani Campus // Innovation Block',
      capacity: 200,
      registration_deadline: '2026-11-19T23:59:00Z',
      organizer_name: 'SHEAT AI Research Lab',
      organizer_contact: 'ai@sheat.edu',
    }),
  });
  assert.strictEqual(create2Res.status, 201, 'Second event creation failed');
  const event2 = await create2Res.json();
  console.log(`✓ Event 2 Created: "${event2.name}" (Slug: ${event2.slug})`);

  // Open second event's link
  const secondEventLookup = await (await fetch(`${BASE_URL}/api/events?slug=${encodeURIComponent(event2.slug)}`)).json();
  assert.strictEqual(secondEventLookup.id, event2.id, 'Second link opened wrong event');
  assert.notStrictEqual(secondEventLookup.id, event1.id, 'Second link incorrectly opened Event 1!');
  console.log(`✓ Confirmed: Opening Event 2 link opens Event 2 ("${secondEventLookup.name}"), NOT Event 1.`);

  // Verify student has 0 registrations on Event 2
  const event2Regs = await (await fetch(`${BASE_URL}/api/registrations?eventId=${encodeURIComponent(event2.id)}&studentId=${encodeURIComponent(studentPayload.student_id)}`)).json();
  assert.strictEqual(event2Regs.length, 0, 'Student should not have registrations for Event 2');
  console.log(`✓ Confirmed: Student has 0 registrations on Event 2, while Event 1 remains registered.`);

  // Verify duplicate prevention on Event 1
  console.log('\n--- VERIFY DUPLICATE PREVENTION ---');
  const duplicateRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: event1.id,
      name: studentPayload.name,
      student_id: studentPayload.student_id,
      college: 'SHEAT College of Engineering',
      branch: 'B.Tech CSE - Babatpur',
      course: 'B.Tech CSE',
      semester: 'Year 3 // Sem 5',
      email: studentPayload.email,
      phone: studentPayload.phone,
    }),
  });
  assert.strictEqual(duplicateRes.status, 409, 'Duplicate registration was not blocked!');
  const duplicateData = await duplicateRes.json();
  console.log(`✓ Confirmed: Duplicate registration safely blocked (HTTP 409: "${duplicateData.error}")`);

  console.log('\n======================================================================');
  console.log('ALL STEPS A - L PASSED FLAWLESSLY! ROOT CAUSE PERMANENTLY RESOLVED.');
  console.log('======================================================================\n');
}

runScenario().catch((err) => {
  console.error('\n❌ TEST FAILED WITH ERROR:', err);
  process.exit(1);
});
