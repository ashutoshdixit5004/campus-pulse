// Test script for Update 1: Auth, Student Accounts, Event Management & Evaluation
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('===============================================================');
  console.log('STARTING UPDATE #1 INTEGRATION & REGRESSION SUITE');
  console.log('===============================================================\n');

  // Test 1: Event Registration URLs Isolation
  console.log('--- TEST 1: Event Registration URLs Isolation ---');
  const slugs = ['engineers-day', 'hackathon-2026'];
  for (const slug of slugs) {
    const res = await fetch(`${BASE_URL}/register/${slug}`);
    if (res.status !== 200) {
      throw new Error(`Public registration page for /register/${slug} returned HTTP ${res.status}`);
    }
    const html = await res.text();
    if (!html.includes(slug)) {
      throw new Error(`Registration page for ${slug} did not contain the slug in rendered output!`);
    }
    console.log(`✓ Confirmed public registration route /register/${slug} resolves correctly (HTTP 200)`);
  }

  // Test 2: Admin Authentication & Password Security
  console.log('\n--- TEST 2: Admin Authentication & Zero-Credential Exposure ---');
  // Invalid login
  const badAdminRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vipasha@sheat.edu', password: 'wrongpassword' }),
  });
  if (badAdminRes.status !== 401) {
    throw new Error(`Admin login with invalid password should return 401, got ${badAdminRes.status}`);
  }
  console.log('✓ Rejected invalid admin credentials with HTTP 401');

  // Valid login
  const validAdminRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vipasha@sheat.edu', password: 'admin' }),
  });
  if (!validAdminRes.ok) {
    throw new Error(`Admin login failed: ${validAdminRes.status} ${await validAdminRes.text()}`);
  }
  const adminData = await validAdminRes.json();
  if (!adminData.user || adminData.user.name !== 'Dr. Vipasha') {
    throw new Error(`Expected admin Dr. Vipasha, got: ${JSON.stringify(adminData)}`);
  }
  if (adminData.user.password || adminData.user.password_hash) {
    throw new Error('SECURITY VIOLATION: Admin password returned in response!');
  }
  console.log(`✓ Admin login successful for "${adminData.user.name}". Zero password exposure verified.`);

  // Test 3: Safe Event Archival & Deletion
  console.log('\n--- TEST 3: Safe Event Deletion & Archival ---');
  const tempSlug = `test-del-${Date.now()}`;
  const createEvRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Event to Delete',
      slug: tempSlug,
      description: 'Event created to test safe deletion',
      category: 'Technical',
      date: '2026-12-01',
      start_time: '10:00',
      end_time: '12:00',
      venue: 'Lab 4',
      capacity: 30,
      organizer_name: 'Test Org',
      organizer_contact: 'test@campus.edu',
      status: 'OPEN',
    }),
  });
  const createdEv = await createEvRes.json();
  console.log(`✓ Created test event: ID=${createdEv.id}`);

  // Safe archive delete
  const delRes = await fetch(`${BASE_URL}/api/events?id=${createdEv.id}&permanent=false`, {
    method: 'DELETE',
  });
  if (!delRes.ok) {
    throw new Error(`Event delete failed: ${delRes.status} ${await delRes.text()}`);
  }
  const delData = await delRes.json();
  console.log(`✓ Safe archive executed: ${delData.message} (Archived=${delData.archived})`);

  // Verify it is excluded from default events list
  const listRes = await fetch(`${BASE_URL}/api/events`);
  const activeEvents = await listRes.json();
  if (activeEvents.some((e) => e.id === createdEv.id)) {
    throw new Error(`Archived event ${createdEv.id} still found in active events list!`);
  }
  console.log('✓ Verified archived event is excluded from standard event listings');

  // Test 4: Student Account Signup & Login
  console.log('\n--- TEST 4: Student Signup, Login & Session ---');
  const uniqueStudId = `TEST_${Date.now()}`;
  const uniqueEmail = `test_${Date.now()}@sheat.edu`;
  const signupRes = await fetch(`${BASE_URL}/api/student/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: uniqueStudId,
      name: 'Priya Sharma',
      email: uniqueEmail,
      college: 'SHEAT College of Engineering',
      course: 'B.Tech IT',
      semester: 'Year 2 // Sem 4',
      phone: '+91 91234 56789',
      password: 'mypassword123',
    }),
  });
  if (!signupRes.ok) {
    throw new Error(`Student signup failed: ${signupRes.status} ${await signupRes.text()}`);
  }
  const signupData = await signupRes.json();
  if (!signupData.student || signupData.student.name !== 'Priya Sharma') {
    throw new Error(`Unexpected student returned: ${JSON.stringify(signupData)}`);
  }
  if (signupData.student.password || signupData.student.password_hash) {
    throw new Error('SECURITY VIOLATION: Student password returned in signup response!');
  }
  console.log(`✓ Student signup successful for "${signupData.student.name}" (ID=${uniqueStudId}). Password not exposed.`);

  // Test Student Login
  const loginRes = await fetch(`${BASE_URL}/api/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: uniqueStudId,
      password: 'mypassword123',
    }),
  });
  if (!loginRes.ok) {
    throw new Error(`Student login failed: ${loginRes.status} ${await loginRes.text()}`);
  }
  const loginData = await loginRes.json();
  if (loginData.student.password || loginData.student.password_hash) {
    throw new Error('SECURITY VIOLATION: Student password returned in login response!');
  }
  console.log(`✓ Student login successful for ID=${uniqueStudId}`);

  // Test 5: Student Data Isolation
  console.log('\n--- TEST 5: Student Data Isolation ---');
  // Query registrations specifically for Ashutosh Dixit
  const ashutoshRegsRes = await fetch(`${BASE_URL}/api/registrations?studentId=2503840100024`);
  const ashutoshRegs = await ashutoshRegsRes.json();
  console.log(`✓ Ashutosh registrations count: ${ashutoshRegs.length}`);

  // Query registrations for the new student Priya Sharma
  const priyaRegsRes = await fetch(`${BASE_URL}/api/registrations?studentId=${uniqueStudId}`);
  const priyaRegs = await priyaRegsRes.json();
  console.log(`✓ Priya registrations count: ${priyaRegs.length}`);

  if (priyaRegs.some((r) => r.student_id === '2503840100024')) {
    throw new Error('DATA LEAK: Priya can see Ashutosh Dixit registrations!');
  }
  console.log('✓ Student isolation confirmed: Student A and Student B data streams are completely isolated.');

  // Test 6: Event Evaluation & Winner Badges
  console.log('\n--- TEST 6: Event Evaluation, Scoring & Winner Issuance ---');
  // First register Priya for Hackathon 2026
  const eventsRes = await fetch(`${BASE_URL}/api/events`);
  const allEvs = await eventsRes.json();
  const hackEvent = allEvs.find((e) => e.slug === 'hackathon-2026') || allEvs[0];

  const regRes = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: hackEvent.id,
      name: 'Priya Sharma',
      student_id: uniqueStudId,
      college: 'SHEAT College of Engineering',
      course: 'B.Tech IT',
      semester: 'Year 2 // Sem 4',
      email: uniqueEmail,
      phone: '+91 91234 56789',
      team_name: 'NeuralCrafters',
    }),
  });
  const priyaReg = await regRes.json();
  console.log(`✓ Registered Priya for "${hackEvent.name}": Reg ID=${priyaReg.id}`);

  // Admin records evaluation
  const evalRes = await fetch(`${BASE_URL}/api/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: hackEvent.id,
      registration_id: priyaReg.id,
      student_id: uniqueStudId,
      student_name: 'Priya Sharma',
      marks: 96,
      feedback: 'Outstanding algorithmic implementation and presentation.',
      result: 'WINNER',
      certificate_eligible: true,
      evaluated_by: 'Dr. Vipasha',
    }),
  });
  if (!evalRes.ok) {
    throw new Error(`Evaluation save failed: ${evalRes.status} ${await evalRes.text()}`);
  }
  const savedEval = await evalRes.json();
  console.log(`✓ Saved Evaluation: Result="${savedEval.result}", Marks=${savedEval.marks}, Eligible=${savedEval.certificate_eligible}`);

  // Issue Certificate
  const certRes = await fetch(`${BASE_URL}/api/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: hackEvent.id,
      registration_id: priyaReg.id,
      role: '🥇 WINNER &bull; First Prize',
      result: 'WINNER',
      marks: 96,
    }),
  });
  if (!certRes.ok) {
    throw new Error(`Certificate issuance failed: ${certRes.status} ${await certRes.text()}`);
  }
  const certData = await certRes.json();
  console.log(`✓ Certificate issued: ID=${certData.id}, Cert Number=${certData.certificate_number}`);

  // Verify registration now reflects evaluation and certificate
  const checkRegRes = await fetch(`${BASE_URL}/api/registrations?studentId=${uniqueStudId}`);
  const updatedRegs = await checkRegRes.json();
  const updatedPriyaReg = updatedRegs.find((r) => r.id === priyaReg.id);
  if (!updatedPriyaReg || updatedPriyaReg.result !== 'WINNER') {
    throw new Error(`Registration result expected WINNER, got: ${updatedPriyaReg?.result}`);
  }
  console.log(`✓ Confirmed updated registration: Result="${updatedPriyaReg.result}", Marks=${updatedPriyaReg.marks}, Issued=${updatedPriyaReg.certificate_issued}`);

  console.log('\n===============================================================');
  console.log('ALL UPDATE #1 TEST SUITE ASSERTIONS PASSED SUCCESSFULLY!');
  console.log('===============================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ UPDATE #1 TEST SUITE FAILED:', err);
  process.exit(1);
});
