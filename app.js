/**
 * CAMPUS PULSE — COLLEGE EVENT MANAGEMENT SYSTEM
 * State Management & Reactive UI Controller
 */

// Initial Default Mock Dataset
const DEFAULT_EVENTS = [
  {
    id: 'technova-2026',
    name: 'Technova 2026 // 48-Hr Hackathon',
    category: 'Technical',
    date: '2026-10-24',
    time: '09:00 - 21:00',
    venue: 'Main Tech Auditorium // Complex B',
    capacity: 150,
    registered: 127,
    verified: 110,
    checkins: 84,
    regStatus: 'OPEN',
    eventStatus: 'LIVE',
    slug: 'technova-2026'
  },
  {
    id: 'aurora-2026',
    name: 'Aurora Cultural Fest 2026',
    category: 'Cultural',
    date: '2026-11-12',
    time: '17:00 - 22:00',
    venue: 'Open Air Theatre',
    capacity: 500,
    registered: 480,
    verified: 430,
    checkins: 0,
    regStatus: 'OPEN',
    eventStatus: 'UPCOMING',
    slug: 'aurora-2026'
  },
  {
    id: 'robowars-2026',
    name: 'RoboWars Arena Championship',
    category: 'Robotics',
    date: '2026-11-20',
    time: '10:00 - 18:00',
    venue: 'Mechanical Workshop Arena',
    capacity: 100,
    registered: 100,
    verified: 95,
    checkins: 0,
    regStatus: 'CLOSED',
    eventStatus: 'UPCOMING',
    slug: 'robowars-2026'
  },
  {
    id: 'esummit-2026',
    name: 'National E-Summit 2026',
    category: 'Entrepreneurship',
    date: '2026-10-10',
    time: '09:00 - 17:00',
    venue: 'Convention Hall',
    capacity: 250,
    registered: 245,
    verified: 240,
    checkins: 228,
    regStatus: 'CLOSED',
    eventStatus: 'COMPLETED',
    slug: 'esummit-2026'
  }
];

const DEFAULT_REGISTRATIONS = [
  {
    id: 'reg-001',
    eventId: 'technova-2026',
    name: 'Ashutosh Dixit',
    studentId: '2503840100024',
    college: 'SHEAT College of Engineering',
    course: 'B.Tech Computer Science',
    semester: 'Year 3 // Sem 5',
    email: 'dixitashutosh5004@gmail.com',
    phone: '+1 (555) 019-2834',
    date: 'Oct 18, 2026, 14:22',
    status: 'VERIFIED',
    passId: 'PASS-TN-0492',
    checkedIn: true,
    checkinTime: '09:14:22 AM',
    gate: 'Gate 02'
  },
  {
    id: 'reg-002',
    eventId: 'technova-2026',
    name: 'Maya Lin',
    studentId: 'STU-2024-3102',
    college: 'SHEAT College of Engineering',
    course: 'B.Tech AI & Data Science',
    semester: 'Year 2 // Sem 3',
    email: 'maya.lin@campus.edu',
    phone: '+1 (555) 018-9921',
    date: 'Oct 18, 2026, 15:40',
    status: 'VERIFIED',
    passId: 'PASS-TN-0488',
    checkedIn: true,
    checkinTime: '09:12:05 AM',
    gate: 'Gate 02'
  },
  {
    id: 'reg-003',
    eventId: 'technova-2026',
    name: 'Ryan Patel',
    studentId: 'STU-2023-9921',
    college: 'SHEAT College of Engineering',
    course: 'B.Tech Electronics & Comm',
    semester: 'Year 3 // Sem 5',
    email: 'ryan.p@campus.edu',
    phone: '+1 (555) 012-4412',
    date: 'Oct 19, 2026, 10:12',
    status: 'VERIFIED',
    passId: 'PASS-TN-0475',
    checkedIn: true,
    checkinTime: '09:10:48 AM',
    gate: 'Gate 01'
  },
  {
    id: 'reg-004',
    eventId: 'technova-2026',
    name: 'Sarah Jenkins',
    studentId: 'STU-2024-1184',
    college: 'SHEAT College of Engineering',
    course: 'B.Tech Software Engineering',
    semester: 'Year 1 // Sem 1',
    email: 'sarah.j@campus.edu',
    phone: '+1 (555) 017-8832',
    date: 'Oct 19, 2026, 11:35',
    status: 'VERIFIED',
    passId: 'PASS-TN-0461',
    checkedIn: true,
    checkinTime: '09:08:15 AM',
    gate: 'Gate 02'
  },
  {
    id: 'reg-005',
    eventId: 'technova-2026',
    name: 'Marcus Vance',
    studentId: 'STU-2024-4491',
    college: 'SHEAT College of Engineering',
    course: 'B.Tech Mechanical (Mechatronics)',
    semester: 'Year 2 // Sem 3',
    email: 'marcus.v@campus.edu',
    phone: '+1 (555) 019-3312',
    date: 'Oct 20, 2026, 08:44',
    status: 'PENDING',
    passId: null,
    checkedIn: false,
    checkinTime: null,
    gate: null
  },
  {
    id: 'reg-006',
    eventId: 'technova-2026',
    name: 'Elena Rostova',
    studentId: 'STU-2023-7729',
    college: 'SHEAT College of Engineering',
    course: 'B.Tech Computer Science',
    semester: 'Year 4 // Sem 7',
    email: 'elena.r@campus.edu',
    phone: '+1 (555) 014-9901',
    date: 'Oct 20, 2026, 09:15',
    status: 'PENDING',
    passId: null,
    checkedIn: false,
    checkinTime: null,
    gate: null
  },
  {
    id: 'reg-007',
    eventId: 'technova-2026',
    name: 'David Kim',
    studentId: 'STU-2024-5510',
    college: 'SHEAT College of Engineering',
    course: 'B.Tech Electrical & Electronics',
    semester: 'Year 2 // Sem 3',
    email: 'david.kim@campus.edu',
    phone: '+1 (555) 016-7782',
    date: 'Oct 20, 2026, 11:20',
    status: 'VERIFIED',
    passId: 'PASS-TN-0498',
    checkedIn: false,
    checkinTime: null,
    gate: null
  },
  {
    id: 'reg-008',
    eventId: 'technova-2026',
    name: 'Chloe Bennett',
    studentId: 'STU-2024-6632',
    college: 'SHEAT College of Engineering',
    course: 'B.Tech Information Science',
    semester: 'Year 3 // Sem 5',
    email: 'chloe.b@campus.edu',
    phone: '+1 (555) 011-2299',
    date: 'Oct 21, 2026, 14:05',
    status: 'PENDING',
    passId: null,
    checkedIn: false,
    checkinTime: null,
    gate: null
  }
];

// STATE MANAGEMENT
let appState = {
  currentRole: 'admin', // 'admin' | 'student'
  currentView: 'admin-dashboard',
  events: [],
  registrations: [],
  activeRegFilter: 'ALL',
  activeAttendanceFilter: 'ALL',
  selectedRegForDrawer: null,
  recentCheckins: []
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initRouter();
  renderAllViews();
});

function loadState() {
  const saved = localStorage.getItem('campuspulse_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState.events = parsed.events || DEFAULT_EVENTS;
      appState.registrations = parsed.registrations || DEFAULT_REGISTRATIONS;
    } catch (e) {
      resetToDefaults();
    }
  } else {
    resetToDefaults();
  }
}

function saveState() {
  localStorage.setItem('campuspulse_state', JSON.stringify({
    events: appState.events,
    registrations: appState.registrations
  }));
}

function resetToDefaults() {
  appState.events = JSON.parse(JSON.stringify(DEFAULT_EVENTS));
  appState.registrations = JSON.parse(JSON.stringify(DEFAULT_REGISTRATIONS));
  saveState();
}

function resetDemoData() {
  resetToDefaults();
  showToast('Demo data reset to initial showcase state.');
  renderAllViews();
}

// ROUTER & NAVIGATION
function switchRole(role) {
  appState.currentRole = role;

  const btnAdmin = document.getElementById('btnRoleAdmin');
  const btnStudent = document.getElementById('btnRoleStudent');
  const navAdmin = document.getElementById('adminNav');
  const navStudent = document.getElementById('studentNav');

  if (role === 'admin') {
    btnAdmin.classList.add('active');
    btnStudent.classList.remove('active');
    navAdmin.style.display = 'flex';
    navStudent.style.display = 'none';
    navToAdminView('admin-dashboard');
  } else {
    btnStudent.classList.add('active');
    btnAdmin.classList.remove('active');
    navStudent.style.display = 'flex';
    navAdmin.style.display = 'none';
    navToStudentView('student-dashboard');
  }
}

function navToAdminView(viewId) {
  appState.currentView = viewId;
  updateNavbarActiveState('#adminNav', viewId);
  showViewSection('view-' + viewId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navToStudentView(viewId) {
  appState.currentView = viewId;
  updateNavbarActiveState('#studentNav', viewId);
  showViewSection('view-' + viewId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToPublicRegister(eventSlug) {
  // Public registration has no role requirements
  showViewSection('view-public-register');
  document.getElementById('publicRegisterFormCard').style.display = 'block';
  document.getElementById('publicRegisterSuccessCard').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showViewSection(sectionId) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
  }
}

function updateNavbarActiveState(navSelector, viewId) {
  document.querySelectorAll(`${navSelector} .nav-link-btn`).forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
  });
}

function initRouter() {
  window.addEventListener('hashchange', handleHash);
  handleHash();
}

function handleHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('register/')) {
    const slug = hash.replace('register/', '');
    navigateToPublicRegister(slug);
  } else if (hash === 'admin/control') {
    switchRole('admin');
    navToAdminView('admin-dashboard');
  } else if (hash === 'student/passes') {
    switchRole('student');
    navToStudentView('student-pass');
  }
}

// RENDERING PIPELINES
function renderAllViews() {
  renderAdminDashboardStats();
  renderAdminEventsTable();
  renderRegistrationsTable();
  renderAttendanceTable();
  renderMyEventsGrid();
  renderScannerRecentCheckins();
}

// 1. ADMIN DASHBOARD
function renderAdminDashboardStats() {
  const totalEvents = appState.events.length;
  const upcomingEvents = appState.events.filter(e => e.eventStatus === 'UPCOMING' || e.eventStatus === 'LIVE').length;
  const totalRegs = appState.registrations.length + 1412; // Base offset for real-world feel
  const pendingRegs = appState.registrations.filter(r => r.status === 'PENDING').length + 14;
  const verifiedStudents = appState.registrations.filter(r => r.status === 'VERIFIED').length + 1285;
  const checkedInCount = appState.registrations.filter(r => r.checkedIn).length + 80;

  document.getElementById('statTotalEvents').textContent = totalEvents;
  document.getElementById('statUpcomingEvents').textContent = upcomingEvents;
  document.getElementById('statTotalRegistrations').textContent = totalRegs.toLocaleString();
  document.getElementById('statPendingVerifications').textContent = pendingRegs;
  document.getElementById('statVerifiedStudents').textContent = verifiedStudents.toLocaleString();
  document.getElementById('statTodayCheckins').textContent = checkedInCount;

  // Sync sidecar
  const techRegs = appState.registrations.filter(r => r.eventId === 'technova-2026');
  document.getElementById('regCountSidecar').textContent = 120 + techRegs.length;
  document.getElementById('verCountSidecar').textContent = 105 + techRegs.filter(r => r.status === 'VERIFIED').length;
  document.getElementById('penCountSidecar').textContent = techRegs.filter(r => r.status === 'PENDING').length + 14;
}

function renderAdminEventsTable() {
  const tbody = document.getElementById('adminEventsTableBody');
  const search = (document.getElementById('eventTableSearch')?.value || '').toLowerCase();

  const filtered = appState.events.filter(e => 
    e.name.toLowerCase().includes(search) || e.venue.toLowerCase().includes(search)
  );

  tbody.innerHTML = filtered.map(ev => {
    const regBadge = ev.regStatus === 'OPEN' 
      ? '<span class="badge badge-live"><span class="pulse-dot"></span> OPEN</span>'
      : '<span class="badge badge-completed">CLOSED</span>';

    const statusBadge = ev.eventStatus === 'LIVE'
      ? '<span class="badge badge-live">● LIVE</span>'
      : ev.eventStatus === 'UPCOMING'
      ? '<span class="badge badge-upcoming">UPCOMING</span>'
      : '<span class="badge badge-completed">COMPLETED</span>';

    return `
      <tr>
        <td>
          <div class="table-title">${ev.name}</div>
          <div class="table-subtitle">${ev.category}</div>
        </td>
        <td>
          <div>${ev.date}</div>
          <div class="table-subtitle">${ev.time}</div>
        </td>
        <td>${ev.venue}</td>
        <td style="font-family: var(--font-mono);">${ev.capacity}</td>
        <td style="font-family: var(--font-mono); font-weight: 600;">${ev.registered}</td>
        <td style="font-family: var(--font-mono); color: var(--accent-emerald);">${ev.verified}</td>
        <td style="font-family: var(--font-mono); color: var(--accent-orange);">${ev.checkins}</td>
        <td>${regBadge}</td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 4px; justify-content: flex-end; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="navigateToPublicRegister('${ev.slug}')" title="Preview Public Link">
              <i class="fa-solid fa-eye"></i> VIEW
            </button>
            <button class="btn btn-secondary btn-sm" onclick="navToAdminView('admin-registrations')" title="Manage Registrations">
              <i class="fa-solid fa-users"></i> REGS
            </button>
            <button class="btn btn-secondary btn-sm" onclick="navToAdminView('admin-scanner')" title="Open QR Scanner">
              <i class="fa-solid fa-qrcode"></i> SCAN
            </button>
            <button class="btn btn-secondary btn-sm" onclick="navToAdminView('admin-attendance')" title="Attendance Roster">
              <i class="fa-solid fa-chart-simple"></i> ATT
            </button>
            <button class="btn btn-primary btn-sm" onclick="copyEventLink('${ev.slug}')" title="Copy Registration Link">
              <i class="fa-solid fa-link"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterAdminEventsTable() {
  renderAdminEventsTable();
}

// 2. CREATE EVENT LOGIC
function handleCreateEventSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('ceName').value.trim();
  const desc = document.getElementById('ceDesc').value.trim();
  const category = document.getElementById('ceCategory').value;
  const date = document.getElementById('ceDate').value;
  const startTime = document.getElementById('ceStartTime').value;
  const endTime = document.getElementById('ceEndTime').value;
  const venue = document.getElementById('ceVenue').value.trim();
  const capacity = parseInt(document.getElementById('ceCapacity').value) || 150;
  const status = document.getElementById('ceStatus').value;

  // Generate unique URL slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const generatedUrl = `https://campuspulse.vercel.app/register/${slug}`;

  const newEvent = {
    id: slug,
    name: name,
    category: category,
    date: date,
    time: `${startTime} - ${endTime}`,
    venue: venue,
    capacity: capacity,
    registered: 0,
    verified: 0,
    checkins: 0,
    regStatus: status,
    eventStatus: 'UPCOMING',
    slug: slug
  };

  appState.events.unshift(newEvent);
  saveState();

  // Display generated link in terminal box
  document.getElementById('generatedLinkDisplay').textContent = generatedUrl;
  
  showToast(`✓ Event Created! Unique link generated: /register/${slug}`);
  renderAdminDashboardStats();
  renderAdminEventsTable();
}

function copyGeneratedLink() {
  const url = document.getElementById('generatedLinkDisplay').textContent;
  navigator.clipboard.writeText(url).then(() => {
    showToast('✓ Link copied to clipboard!');
  }).catch(() => {
    showToast(`Copied: ${url}`);
  });
}

function copyEventLink(slug) {
  const url = `https://campuspulse.vercel.app/register/${slug}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast(`✓ Copied registration link: ${url}`);
  }).catch(() => {
    showToast(`Link: ${url}`);
  });
}

function shareGeneratedLink() {
  const url = document.getElementById('generatedLinkDisplay').textContent;
  if (navigator.share) {
    navigator.share({
      title: 'Technova 2026 // Registration',
      text: 'Register for Technova 2026 on Campus Pulse. No login required!',
      url: url
    }).catch(() => {});
  } else {
    showToast(`Share URL: ${url}`);
  }
}

function showQrModalForLink() {
  const url = document.getElementById('generatedLinkDisplay').textContent;
  document.getElementById('modalQrLinkText').textContent = url;
  document.getElementById('qrShareModal').classList.add('active');
}

function closeQrModal() {
  document.getElementById('qrShareModal').classList.remove('active');
}

// 3. REGISTRATIONS & VERIFICATION CONSOLE
function setRegFilter(filter) {
  appState.activeRegFilter = filter;
  document.querySelectorAll('#regStatusFilters button').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
  });
  renderRegistrationsTable();
}

function renderRegistrationsTable() {
  const tbody = document.getElementById('registrationsTableBody');
  const search = (document.getElementById('regSearchInput')?.value || '').toLowerCase();
  const filter = appState.activeRegFilter;

  // Filter list
  let list = appState.registrations.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search) || 
                        r.studentId.toLowerCase().includes(search) || 
                        r.email.toLowerCase().includes(search);
    const matchFilter = filter === 'ALL' || r.status === filter;
    return matchSearch && matchFilter;
  });

  // Update counter badges
  const total = appState.registrations.length + 119;
  const pending = appState.registrations.filter(r => r.status === 'PENDING').length + 14;
  const verified = appState.registrations.filter(r => r.status === 'VERIFIED').length + 105;
  const rejected = appState.registrations.filter(r => r.status === 'REJECTED').length;

  document.getElementById('countAllReg').textContent = total;
  document.getElementById('countPendingReg').textContent = pending;
  document.getElementById('countVerifiedReg').textContent = verified;
  document.getElementById('countRejectedReg').textContent = rejected;

  tbody.innerHTML = list.map(reg => {
    let statusBadge = '<span class="badge badge-pending">PENDING</span>';
    if (reg.status === 'VERIFIED') {
      statusBadge = '<span class="badge badge-verified"><i class="fa-solid fa-check"></i> VERIFIED</span>';
    } else if (reg.status === 'REJECTED') {
      statusBadge = '<span class="badge badge-rejected"><i class="fa-solid fa-xmark"></i> REJECTED</span>';
    }

    return `
      <tr>
        <td>
          <div class="table-title">${reg.name}</div>
          <div class="table-subtitle">${reg.college || 'Apex Institute'}</div>
        </td>
        <td style="font-family: var(--font-mono);">${reg.studentId}</td>
        <td>${reg.course}</td>
        <td style="font-size: 12px; color: var(--text-muted);">${reg.email}</td>
        <td style="font-size: 12px;">${reg.date}</td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="openVerificationDrawer('${reg.id}')">
              <i class="fa-solid fa-id-card"></i> VIEW DETAILS
            </button>
            ${reg.status === 'PENDING' ? `
              <button class="btn btn-primary btn-sm" onclick="quickVerify('${reg.id}')">
                <i class="fa-solid fa-check"></i> VERIFY
              </button>
              <button class="btn btn-secondary btn-sm" style="color: #f87171;" onclick="openVerificationDrawer('${reg.id}', true)">
                <i class="fa-solid fa-xmark"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openVerificationDrawer(regId, showRejectField = false) {
  const reg = appState.registrations.find(r => r.id === regId);
  if (!reg) return;

  appState.selectedRegForDrawer = reg;

  document.getElementById('drawerStudentName').textContent = reg.name;
  document.getElementById('drawerStudentId').textContent = reg.studentId;
  document.getElementById('drawerCollege').textContent = reg.college || 'SHEAT College of Engineering';
  document.getElementById('drawerCourse').textContent = `${reg.course} • ${reg.semester}`;
  document.getElementById('drawerEmail').textContent = `${reg.email} • ${reg.phone || '+1 555-0192'}`;
  document.getElementById('drawerRegDate').textContent = reg.date;

  const badge = document.getElementById('drawerStatusBadge');
  if (reg.status === 'VERIFIED') {
    badge.className = 'badge badge-verified';
    badge.innerHTML = '<i class="fa-solid fa-check"></i> VERIFIED (PASS GENERATED)';
    document.getElementById('btnVerifyDrawer').style.display = 'none';
  } else if (reg.status === 'REJECTED') {
    badge.className = 'badge badge-rejected';
    badge.innerHTML = '<i class="fa-solid fa-xmark"></i> REGISTRATION REJECTED';
    document.getElementById('btnVerifyDrawer').style.display = 'none';
  } else {
    badge.className = 'badge badge-pending';
    badge.textContent = 'PENDING VERIFICATION';
    document.getElementById('btnVerifyDrawer').style.display = 'inline-flex';
  }

  const rejectSec = document.getElementById('rejectionSection');
  rejectSec.style.display = showRejectField ? 'block' : 'none';

  document.getElementById('verificationDrawer').classList.add('open');
}

function closeVerificationDrawer() {
  document.getElementById('verificationDrawer').classList.remove('open');
}

function handleDrawerVerify() {
  if (!appState.selectedRegForDrawer) return;
  const reg = appState.selectedRegForDrawer;

  reg.status = 'VERIFIED';
  reg.passId = `PASS-TN-${Math.floor(1000 + Math.random() * 9000)}`;
  saveState();

  closeVerificationDrawer();
  showToast(`✓ Registration Verified! Digital QR Pass Generated for ${reg.name} (${reg.passId})`);
  renderAllViews();
}

function handleDrawerReject() {
  if (!appState.selectedRegForDrawer) return;
  const reg = appState.selectedRegForDrawer;
  const reason = document.getElementById('rejectionReasonSelect').value;

  reg.status = 'REJECTED';
  reg.rejectionReason = reason;
  saveState();

  closeVerificationDrawer();
  showToast(`✕ Registration Rejected: ${reason}`);
  renderAllViews();
}

function quickVerify(regId) {
  const reg = appState.registrations.find(r => r.id === regId);
  if (reg) {
    reg.status = 'VERIFIED';
    reg.passId = `PASS-TN-${Math.floor(1000 + Math.random() * 9000)}`;
    saveState();
    showToast(`✓ Verified ${reg.name}! Digital pass activated.`);
    renderAllViews();
  }
}

// 4. QR SCANNER & TURNSTILE STATION
function simulateScan(type) {
  const resultContainer = document.getElementById('scanResultContainer');
  const gate = document.getElementById('scannerGateSelect').value;
  const event = document.getElementById('scannerEventSelect').value;

  if (type === 'valid') {
    const timestamp = new Date().toLocaleTimeString();
    resultContainer.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid var(--accent-emerald); border-radius: var(--radius-sm); padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge badge-verified" style="font-size: 13px; padding: 4px 10px;">
            <i class="fa-solid fa-check-double"></i> ✓ ENTRY VERIFIED
          </span>
          <span class="mono-tag" style="color: var(--accent-emerald); font-weight: 700;">CHECKED IN</span>
        </div>
        <div style="font-size: 20px; font-weight: 800; font-family: var(--font-display);">Ashutosh Dixit</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Student ID: 2503840100024 &bull; B.Tech CSE</div>
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(16, 185, 129, 0.2); display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px;">
          <span>PASS ID: <strong style="color: var(--accent-cyan);">PASS-TN-0492</strong></span>
          <span>TIME: <strong>${timestamp}</strong></span>
          <span>GATE: <strong>${gate.split(' - ')[0]}</strong></span>
        </div>
      </div>
    `;

    // Log check-in
    addRecentCheckin('Ashutosh Dixit', 'PASS-TN-0492', '2503840100024', gate.split(' - ')[0], timestamp);
    showToast('✓ Turnstile Unlocked: Ashutosh Dixit checked in.');
  } 
  else if (type === 'duplicate') {
    resultContainer.innerHTML = `
      <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid var(--accent-amber); border-radius: var(--radius-sm); padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge badge-pending" style="font-size: 13px; padding: 4px 10px; color: #fbbf24; border-color: #fbbf24;">
            <i class="fa-solid fa-triangle-exclamation"></i> ⚠ ALREADY CHECKED IN
          </span>
          <span class="mono-tag" style="color: #fbbf24;">DUPLICATE REJECTED</span>
        </div>
        <div style="font-size: 18px; font-weight: 700;">Pass ID: PASS-TN-0492 (Ashutosh Dixit)</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          Pass already scanned at <strong>09:14 AM</strong> by Gate 02. Turnstile barrier remains locked.
        </div>
      </div>
    `;
    showToast('⚠ Duplicate Scan: Attendee already checked in.');
  }
  else if (type === 'unverified') {
    resultContainer.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--accent-rose); border-radius: var(--radius-sm); padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge badge-rejected" style="font-size: 13px; padding: 4px 10px;">
            <i class="fa-solid fa-ban"></i> ✕ REGISTRATION NOT VERIFIED
          </span>
          <span class="mono-tag" style="color: #f87171;">ENTRY REFUSED</span>
        </div>
        <div style="font-size: 18px; font-weight: 700;">Marcus Vance (STU-2024-4491)</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          Applicant status is currently <strong>PENDING</strong> review in the admin verification console.
        </div>
      </div>
    `;
    showToast('✕ Entry Denied: Registration not verified.');
  }
  else if (type === 'wrong-event') {
    resultContainer.innerHTML = `
      <div style="background: rgba(192, 132, 252, 0.12); border: 1px solid #c084fc; border-radius: var(--radius-sm); padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge" style="background: rgba(192, 132, 252, 0.2); color: #c084fc; border: 1px solid #c084fc; font-size: 13px; padding: 4px 10px;">
            <i class="fa-solid fa-shuffle"></i> ⚠ WRONG EVENT
          </span>
          <span class="mono-tag" style="color: #c084fc;">INVALID TARGET</span>
        </div>
        <div style="font-size: 18px; font-weight: 700;">Pass valid for Aurora Cultural Fest 2026</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          This gate is currently validating credentials for <strong>Technova 2026</strong>.
        </div>
      </div>
    `;
    showToast('⚠ Wrong Event: Pass belongs to a different schedule.');
  }
  else if (type === 'invalid') {
    resultContainer.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--accent-rose); border-radius: var(--radius-sm); padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge badge-rejected" style="font-size: 13px; padding: 4px 10px;">
            <i class="fa-solid fa-xmark"></i> ✕ INVALID PASS
          </span>
          <span class="mono-tag" style="color: #f87171;">UNKNOWN CODE</span>
        </div>
        <div style="font-size: 18px; font-weight: 700;">Unrecognized QR Signature</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          Scanned barcode does not exist in the institutional registry database.
        </div>
      </div>
    `;
    showToast('✕ Invalid Pass scanned.');
  }
}

function handleManualPassSubmit() {
  const input = document.getElementById('manualPassInput').value.trim();
  if (!input) {
    showToast('Please enter a Pass ID or Student ID.');
    return;
  }

  // Look up in registration list
  const match = appState.registrations.find(r => 
    (r.passId && r.passId.toLowerCase() === input.toLowerCase()) || 
    r.studentId.toLowerCase() === input.toLowerCase()
  );

  if (match) {
    if (match.status === 'VERIFIED') {
      if (match.checkedIn) {
        simulateScan('duplicate');
      } else {
        match.checkedIn = true;
        match.checkinTime = new Date().toLocaleTimeString();
        match.gate = 'Gate 02';
        saveState();
        simulateScan('valid');
        renderAttendanceTable();
      }
    } else {
      simulateScan('unverified');
    }
  } else {
    simulateScan('invalid');
  }

  document.getElementById('manualPassInput').value = '';
}

function addRecentCheckin(name, passId, studentId, gate, time) {
  appState.recentCheckins.unshift({
    name, passId, studentId, gate, time
  });
  renderScannerRecentCheckins();
}

function renderScannerRecentCheckins() {
  const tbody = document.getElementById('scannerRecentCheckinsBody');
  const items = appState.recentCheckins.length ? appState.recentCheckins : [
    { name: 'Maya Lin', passId: 'PASS-TN-0488', gate: 'Gate 02', time: '09:12 AM' },
    { name: 'Ryan Patel', passId: 'PASS-TN-0475', gate: 'Gate 01', time: '09:10 AM' },
    { name: 'Sarah Jenkins', passId: 'PASS-TN-0461', gate: 'Gate 02', time: '09:08 AM' },
    { name: 'Devon Shaw', passId: 'PASS-TN-0454', gate: 'Gate 02', time: '09:04 AM' }
  ];

  tbody.innerHTML = items.slice(0, 5).map(item => `
    <tr>
      <td style="font-weight: 600;">${item.name}</td>
      <td style="font-family: var(--font-mono); color: var(--accent-cyan);">${item.passId}</td>
      <td>${item.gate}</td>
      <td style="color: var(--text-muted);">${item.time}</td>
      <td><span class="badge badge-verified">CHECKED IN</span></td>
    </tr>
  `).join('');
}

// 5. ATTENDANCE ANALYTICS & CSV EXPORT
function setAttendanceFilter(filter) {
  appState.activeAttendanceFilter = filter;
  document.querySelectorAll('#attendanceFilterBtns button').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-att-filter') === filter);
  });
  renderAttendanceTable();
}

function renderAttendanceTable() {
  const tbody = document.getElementById('attendanceTableBody');
  const search = (document.getElementById('attendanceSearchInput')?.value || '').toLowerCase();
  const filter = appState.activeAttendanceFilter;

  // Compute metrics
  const verifiedList = appState.registrations.filter(r => r.status === 'VERIFIED');
  const checkedInList = verifiedList.filter(r => r.checkedIn);
  const notCheckedInList = verifiedList.filter(r => !r.checkedIn);

  const totalVerified = verifiedList.length + 120;
  const totalChecked = checkedInList.length + 80;
  const totalNotChecked = totalVerified - totalChecked;
  const percentage = ((totalChecked / totalVerified) * 100).toFixed(1);

  document.getElementById('attVerifiedTotal').textContent = totalVerified;
  document.getElementById('attCheckedInTotal').textContent = totalChecked;
  document.getElementById('attNotCheckedInTotal').textContent = totalNotChecked;
  document.getElementById('attPercentageTotal').textContent = `${percentage}%`;

  let displayList = verifiedList.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search) || 
                        r.studentId.toLowerCase().includes(search) || 
                        (r.passId && r.passId.toLowerCase().includes(search));
    const matchFilter = filter === 'ALL' ? true :
                        filter === 'CHECKED_IN' ? r.checkedIn : !r.checkedIn;
    return matchSearch && matchFilter;
  });

  tbody.innerHTML = displayList.map(item => {
    const statusBadge = item.checkedIn 
      ? '<span class="badge badge-verified"><i class="fa-solid fa-check"></i> CHECKED IN</span>'
      : '<span class="badge badge-pending">NOT CHECKED IN</span>';

    return `
      <tr>
        <td style="font-weight: 600;">${item.name}</td>
        <td style="font-family: var(--font-mono);">${item.studentId}</td>
        <td>${item.course}</td>
        <td style="font-family: var(--font-mono); color: var(--accent-cyan);">${item.passId || '—'}</td>
        <td style="font-family: var(--font-mono); font-size: 12px;">${item.checkinTime || '—'}</td>
        <td>${item.gate || '—'}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

function exportAttendanceCSV() {
  const verifiedList = appState.registrations.filter(r => r.status === 'VERIFIED');
  let csvContent = 'Student Name,Student ID,Course,Email,Pass ID,Check-in Time,Gate,Status\n';
  
  verifiedList.forEach(r => {
    csvContent += `"${r.name}","${r.studentId}","${r.course}","${r.email}","${r.passId || ''}","${r.checkinTime || ''}","${r.gate || ''}","${r.checkedIn ? 'CHECKED_IN' : 'NOT_CHECKED_IN'}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `technova_2026_attendance_roster_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('✓ Attendance Roster CSV exported successfully.');
}

// 6. PUBLIC STUDENT REGISTRATION LOGIC
function handlePublicStudentSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('regFullName').value.trim();
  const studentId = document.getElementById('regStudentId').value.trim();
  const college = document.getElementById('regCollege').value.trim();
  const course = document.getElementById('regCourse').value.trim();
  const semester = document.getElementById('regSemester').value;
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();

  const regCode = `REG-2026-TN-${Math.floor(1000 + Math.random() * 9000)}`;

  const newReg = {
    id: `reg-${Date.now()}`,
    eventId: 'technova-2026',
    name: name,
    studentId: studentId,
    college: college,
    course: course,
    semester: semester,
    email: email,
    phone: phone,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'PENDING',
    passId: null,
    checkedIn: false,
    checkinTime: null,
    gate: null
  };

  appState.registrations.unshift(newReg);
  saveState();

  // Transition to confirmation state
  document.getElementById('publicRegisterFormCard').style.display = 'none';
  document.getElementById('publicRegisterSuccessCard').style.display = 'block';
  document.getElementById('successRegCode').textContent = regCode;

  showToast('✓ Registration submitted! Awaiting coordinator verification.');
  renderAllViews();
}

// 7. STUDENT "MY EVENTS"
function setMyEventsTab(tab) {
  document.querySelectorAll('[data-me-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-me-tab') === tab);
  });
  renderMyEventsGrid(tab);
}

function renderMyEventsGrid(tab = 'ALL') {
  const container = document.getElementById('myEventsGrid');
  if (!container) return;

  const events = [
    {
      name: 'Technova 2026 // 48-Hr Hackathon',
      date: 'Oct 24, 2026 • 09:00 AM',
      venue: 'Main Tech Auditorium',
      regStatus: 'VERIFIED',
      passStatus: 'READY',
      checkinStatus: 'READY FOR ENTRY',
      tabType: ['VERIFIED', 'UPCOMING']
    },
    {
      name: 'Aurora Cultural Fest 2026',
      date: 'Nov 12, 2026 • 17:00 PM',
      venue: 'Open Air Theatre',
      regStatus: 'PENDING',
      passStatus: 'LOCKED',
      checkinStatus: 'UNCONFIRMED',
      tabType: ['PENDING', 'UPCOMING']
    },
    {
      name: 'National E-Summit 2026',
      date: 'Oct 10, 2026 • 09:00 AM',
      venue: 'Convention Hall',
      regStatus: 'VERIFIED',
      passStatus: 'SCANNED',
      checkinStatus: 'ATTENDED',
      tabType: ['ATTENDED', 'COMPLETED']
    },
    {
      name: 'Robotics Workshop & Dev Sprint',
      date: 'Sep 28, 2026 • 10:00 AM',
      venue: 'Engineering Lab 04',
      regStatus: 'VERIFIED',
      passStatus: 'SCANNED',
      checkinStatus: 'ATTENDED',
      tabType: ['ATTENDED', 'COMPLETED']
    }
  ];

  const filtered = tab === 'ALL' ? events : events.filter(e => e.tabType.includes(tab));

  container.innerHTML = filtered.map(ev => {
    let actionArea = '';
    if (ev.regStatus === 'PENDING') {
      actionArea = `
        <span class="badge badge-pending"><i class="fa-solid fa-hourglass-half"></i> WAITING FOR VERIFICATION</span>
        <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 6px;">Coordinator auditing credentials</span>
      `;
    } else if (ev.checkinStatus === 'ATTENDED') {
      actionArea = `
        <div style="display: flex; gap: 6px; align-items: center;">
          <span class="badge badge-verified"><i class="fa-solid fa-check"></i> ATTENDED</span>
          <button class="btn btn-cyan btn-sm" onclick="previewCertificateModal('${ev.name}', 'Ashutosh Dixit', 'Verified Attendee', '${ev.date.split(' • ')[0]}')">
            <i class="fa-solid fa-award"></i> CERTIFICATE AVAILABLE
          </button>
        </div>
      `;
    } else {
      actionArea = `
        <button class="btn btn-primary btn-sm" onclick="navToStudentView('student-pass')">
          <i class="fa-solid fa-ticket"></i> VIEW DIGITAL PASS
        </button>
      `;
    }

    return `
      <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div class="mono-tag" style="color: var(--accent-orange); font-size: 10px;">CAMPUS EVENT</div>
            <span class="mono-tag" style="color: var(--text-muted);">${ev.regStatus}</span>
          </div>
          <h3 style="font-size: 18px; margin-bottom: 0.25rem;">${ev.name}</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i> ${ev.date}</p>
          <p style="font-size: 13px; color: var(--text-muted);"><i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i> ${ev.venue}</p>
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: var(--border-hairline);">
          ${actionArea}
        </div>
      </div>
    `;
  }).join('');
}

// 8. PASS ACTIONS & PRINT
function printPass() {
  window.print();
}

function sharePass() {
  const url = window.location.origin + '#student/passes';
  navigator.clipboard.writeText(url).then(() => {
    showToast('✓ Digital pass link copied.');
  }).catch(() => {
    showToast('Pass link ready.');
  });
}

// 9. CERTIFICATES MODAL & ACTIONS
function previewCertificateModal(eventTitle, studentName, role, date) {
  document.getElementById('certEventTitle').textContent = eventTitle;
  document.getElementById('certStudentName').textContent = studentName;
  document.getElementById('certRole').textContent = role;
  document.getElementById('certDate').textContent = date;
  document.getElementById('certAuthCode').textContent = `CERT-${Math.floor(1000 + Math.random() * 9000)}-${studentName.slice(0,2).toUpperCase()}`;

  document.getElementById('certificateModal').classList.add('active');
}

function closeCertificateModal() {
  document.getElementById('certificateModal').classList.remove('active');
}

function downloadCertificateAction() {
  closeCertificateModal();
  showToast('✓ Generating signed PDF certificate for download...');
  setTimeout(() => {
    showToast('✓ Certificate downloaded successfully!');
  }, 1000);
}

function downloadCertificateMock(title) {
  showToast(`✓ Downloading certificate for: ${title}`);
}

function triggerBatchCertificateDispatch() {
  showToast('✓ 84 Certificates dispatched to verified attendee student profiles.');
}

// 10. TOAST NOTIFICATIONS
function showToast(message) {
  const shelf = document.getElementById('toastShelf');
  if (!shelf) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-orange);"></i> <span>${message}</span>`;
  
  shelf.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
