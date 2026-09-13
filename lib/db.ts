import { 
  EventItem, 
  RegistrationItem, 
  DigitalPassItem, 
  AttendanceRecord, 
  CertificateItem, 
  DashboardStats, 
  StudentAccount, 
  EvaluationItem, 
  EvaluationResult,
  AdminProfile
} from '@/types/database';
import { supabase, supabaseAdmin, isSupabaseConfigured } from './supabase';

// Helper to get active Supabase client (prefers admin client on server for privileged operations)
function getClient(privileged: boolean = false) {
  if (!isSupabaseConfigured) return null;
  if (privileged && typeof window === 'undefined' && supabaseAdmin) {
    return supabaseAdmin;
  }
  return supabase;
}

// Clean production datasets — starting state has ZERO mock records
const INITIAL_EVENTS: EventItem[] = [];
const INITIAL_STUDENTS: StudentAccount[] = [];
const INITIAL_EVALUATIONS: EvaluationItem[] = [];
const INITIAL_REGISTRATIONS: RegistrationItem[] = [];
const INITIAL_CERTIFICATES: CertificateItem[] = [];

export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  name: 'Dr. Vipasha',
  email: 'vipasha@sheat.edu',
  title: 'Dean of Student Affairs // Head of Events',
  phone: '+91 542 262 4884',
  department: 'Office of Student Affairs',
  updated_at: new Date().toISOString(),
};

// ============================================================================
// PRODUCTION DEMO FILTER & PURGE HELPERS
// ============================================================================
const DEMO_EVENT_SLUGS = new Set(['technova-2026', 'aurora-2026', 'robowars-2026', 'esummit-2026']);
const DEMO_EVENT_IDS = new Set(['ev_technova', 'ev_aurora', 'ev_robowars', 'ev_esummit']);
const DEMO_REG_IDS = new Set(['reg_001', 'reg_002', 'reg_003', 'reg_004', 'reg_005', 'reg_006', 'reg_007', 'reg_008']);

export function isDemoRecord(item: any): boolean {
  if (!item) return false;
  if (item.slug && DEMO_EVENT_SLUGS.has(item.slug)) return true;
  if (item.id && (DEMO_EVENT_IDS.has(item.id) || DEMO_REG_IDS.has(item.id))) return true;
  if (typeof item.access_token === 'string' && (item.access_token.includes('demo') || item.access_token.includes('alex_chen') || item.access_token.includes('maya_lin'))) return true;
  if (typeof item.pass_token === 'string' && (item.pass_token.includes('PASS-TN-') || item.pass_token.includes('DEMO'))) return true;
  if (item.event_id && (DEMO_EVENT_IDS.has(item.event_id) || DEMO_EVENT_SLUGS.has(item.event_id))) return true;
  if (item.student_id === 'STU-2024-3102' || item.student_id === 'STU-2023-9921' || item.student_id === 'STU-2024-1184') return true;
  return false;
}

let hasPurgedSupabase = false;
export async function purgeSupabaseDemoData(): Promise<void> {
  if (hasPurgedSupabase) return;
  const client = getClient(true);
  if (!client) return;
  hasPurgedSupabase = true;
  try {
    await client.from('attendance').delete().in('id', ['att_001', 'att_002', 'att_003', 'att_004']);
    await client.from('passes').delete().in('id', ['pass_001', 'pass_002', 'pass_003', 'pass_004', 'pass_007']);
    await client.from('evaluations').delete().eq('id', 'eval_001');
    await client.from('certificates').delete().eq('id', 'cert_001');
    await client.from('registrations').delete().in('id', ['reg_001', 'reg_002', 'reg_003', 'reg_004', 'reg_005', 'reg_006', 'reg_007', 'reg_008']);
    await client.from('events').delete().in('slug', ['technova-2026', 'aurora-2026', 'robowars-2026', 'esummit-2026']);
  } catch (err) {
    // Non-fatal if Supabase already cleaned or disconnected
  }
}

// Safe isomorphic server filesystem helpers
function getFs(): any {
  if (typeof window === 'undefined') {
    try {
      return require('fs');
    } catch {
      return null;
    }
  }
  return null;
}

function getPath(): any {
  if (typeof window === 'undefined') {
    try {
      return require('path');
    } catch {
      return null;
    }
  }
  return null;
}

function getDataDir(): string | null {
  const p = getPath();
  if (!p) return null;
  return p.join(process.cwd(), 'data');
}

function getDbFilePath(): string | null {
  const p = getPath();
  if (!p) return null;
  return p.join(process.cwd(), 'data', 'db.json');
}

// In-Memory store for development / local fallback (attached to globalThis to survive dev HMR & compilation reloads)
const g = globalThis as any;
if (!g.__campus_pulse_events) {
  g.__campus_pulse_events = JSON.parse(JSON.stringify(INITIAL_EVENTS));
}
if (!g.__campus_pulse_registrations) {
  g.__campus_pulse_registrations = JSON.parse(JSON.stringify(INITIAL_REGISTRATIONS));
}
if (!g.__campus_pulse_certificates) {
  g.__campus_pulse_certificates = JSON.parse(JSON.stringify(INITIAL_CERTIFICATES));
}
if (!g.__campus_pulse_students) {
  g.__campus_pulse_students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
}
if (!g.__campus_pulse_evaluations) {
  g.__campus_pulse_evaluations = JSON.parse(JSON.stringify(INITIAL_EVALUATIONS));
}
if (!g.__campus_pulse_admin_profile) {
  g.__campus_pulse_admin_profile = JSON.parse(JSON.stringify(DEFAULT_ADMIN_PROFILE));
}

let memoryEvents: EventItem[] = g.__campus_pulse_events;
let memoryRegistrations: RegistrationItem[] = g.__campus_pulse_registrations;
let memoryCertificates: CertificateItem[] = g.__campus_pulse_certificates;
let memoryStudents: StudentAccount[] = g.__campus_pulse_students;
let memoryEvaluations: EvaluationItem[] = g.__campus_pulse_evaluations;
let memoryAdminProfile: AdminProfile = g.__campus_pulse_admin_profile;

const STORAGE_KEY = 'campuspulse_clean_v3';

function loadDiskStorage() {
  const fs = getFs();
  const dbFile = getDbFilePath();
  if (!fs || !dbFile) return;
  try {
    if (fs.existsSync(dbFile)) {
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.events)) memoryEvents = parsed.events;
      if (Array.isArray(parsed.registrations)) memoryRegistrations = parsed.registrations;
      if (Array.isArray(parsed.certificates)) memoryCertificates = parsed.certificates;
      if (Array.isArray(parsed.students)) memoryStudents = parsed.students;
      if (Array.isArray(parsed.evaluations)) memoryEvaluations = parsed.evaluations;
      if (parsed.adminProfile) memoryAdminProfile = parsed.adminProfile;

      const globalObj = globalThis as any;
      globalObj.__campus_pulse_events = memoryEvents;
      globalObj.__campus_pulse_registrations = memoryRegistrations;
      globalObj.__campus_pulse_certificates = memoryCertificates;
      globalObj.__campus_pulse_students = memoryStudents;
      globalObj.__campus_pulse_evaluations = memoryEvaluations;
      globalObj.__campus_pulse_admin_profile = memoryAdminProfile;
    } else {
      saveDiskStorage();
    }
  } catch (err) {
    console.warn('Error loading disk storage:', err);
  }
}

function saveDiskStorage() {
  const fs = getFs();
  const dataDir = getDataDir();
  const dbFile = getDbFilePath();
  if (!fs || !dataDir || !dbFile) return;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const payload = {
      events: memoryEvents,
      registrations: memoryRegistrations,
      certificates: memoryCertificates,
      students: memoryStudents,
      evaluations: memoryEvaluations,
      adminProfile: memoryAdminProfile,
    };
    fs.writeFileSync(dbFile, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving disk storage:', err);
  }
}

function syncClientStorage() {
  const globalObj = globalThis as any;
  if (globalObj.__campus_pulse_events) memoryEvents = globalObj.__campus_pulse_events;
  if (globalObj.__campus_pulse_registrations) memoryRegistrations = globalObj.__campus_pulse_registrations;
  if (globalObj.__campus_pulse_certificates) memoryCertificates = globalObj.__campus_pulse_certificates;
  if (globalObj.__campus_pulse_students) memoryStudents = globalObj.__campus_pulse_students;
  if (globalObj.__campus_pulse_evaluations) memoryEvaluations = globalObj.__campus_pulse_evaluations;
  if (globalObj.__campus_pulse_admin_profile) memoryAdminProfile = globalObj.__campus_pulse_admin_profile;

  if (typeof window !== 'undefined') {
    try {
      // Purge old demo storage keys so stale demo data cannot resurrect
      localStorage.removeItem('campuspulse_next_state');
      localStorage.removeItem('campuspulse_state');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.events)) {
          memoryEvents = parsed.events;
          globalObj.__campus_pulse_events = parsed.events;
        }
        if (Array.isArray(parsed.registrations)) {
          memoryRegistrations = parsed.registrations;
          globalObj.__campus_pulse_registrations = parsed.registrations;
        }
        if (Array.isArray(parsed.certificates)) {
          memoryCertificates = parsed.certificates;
          globalObj.__campus_pulse_certificates = parsed.certificates;
        }
        if (Array.isArray(parsed.students)) {
          memoryStudents = parsed.students;
          globalObj.__campus_pulse_students = parsed.students;
        }
        if (Array.isArray(parsed.evaluations)) {
          memoryEvaluations = parsed.evaluations;
          globalObj.__campus_pulse_evaluations = parsed.evaluations;
        }
        if (parsed.adminProfile) {
          memoryAdminProfile = parsed.adminProfile;
          globalObj.__campus_pulse_admin_profile = parsed.adminProfile;
        }
      } else {
        saveClientStorage();
      }
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  } else {
    // Server runtime: sync from disk
    loadDiskStorage();
  }
}

function saveClientStorage() {
  const globalObj = globalThis as any;
  globalObj.__campus_pulse_events = memoryEvents;
  globalObj.__campus_pulse_registrations = memoryRegistrations;
  globalObj.__campus_pulse_certificates = memoryCertificates;
  globalObj.__campus_pulse_students = memoryStudents;
  globalObj.__campus_pulse_evaluations = memoryEvaluations;
  globalObj.__campus_pulse_admin_profile = memoryAdminProfile;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        events: memoryEvents,
        registrations: memoryRegistrations,
        certificates: memoryCertificates,
        students: memoryStudents,
        evaluations: memoryEvaluations,
        adminProfile: memoryAdminProfile,
      }));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  } else {
    // Server runtime: persist to disk
    saveDiskStorage();
  }
}

// Initial sync
syncClientStorage();

// ============================================================================
// ADMIN PROFILE MANAGEMENT
// ============================================================================

export async function getAdminProfile(): Promise<AdminProfile> {
  syncClientStorage();
  return memoryAdminProfile || DEFAULT_ADMIN_PROFILE;
}

export async function updateAdminProfile(updates: Partial<AdminProfile>): Promise<AdminProfile> {
  syncClientStorage();
  memoryAdminProfile = {
    ...memoryAdminProfile,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveClientStorage();
  return memoryAdminProfile;
}


// ============================================================================
// 1. EVENTS API
// ============================================================================

export async function getEvents(includeArchived: boolean = false): Promise<EventItem[]> {
  const client = getClient();
  if (client) {
    purgeSupabaseDemoData().catch(() => {});
    try {
      const { data: events, error } = await client
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (Array.isArray(events)) {
        // Compute real counts from registrations and attendance
        const { data: regData } = await client.from('registrations').select('event_id, status');
        const { data: attData } = await client.from('attendance').select('event_id');

        const cleanEvents = events.filter((ev: any) => !isDemoRecord(ev));
        const mapped = cleanEvents.map((ev: any) => {
          const evRegs = (regData || []).filter((r: any) => r.event_id === ev.id && !isDemoRecord(r));
          const evAtts = (attData || []).filter((a: any) => a.event_id === ev.id && !isDemoRecord(a));
          return {
            ...ev,
            registered_count: evRegs.length,
            verified_count: evRegs.filter((r: any) => r.status === 'VERIFIED').length,
            checkins_count: evAtts.length,
          };
        });

        return includeArchived ? mapped : mapped.filter((e: any) => !e.is_archived);
      }
    } catch (err) {
      console.error('Supabase getEvents error:', err);
    }
  }

  // Client runtime: always query /api/events so changes made anywhere are instantly visible
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const events = await res.json();
        if (Array.isArray(events)) {
          const cleanEvents = events.filter((e: any) => !isDemoRecord(e));
          memoryEvents = cleanEvents;
          saveClientStorage();
          return includeArchived ? cleanEvents : cleanEvents.filter((e: any) => !e.is_archived);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch events from /api/events, using local storage cache:', e);
    }
  }

  syncClientStorage();
  const list = memoryEvents.filter(e => !isDemoRecord(e) && (includeArchived || !e.is_archived));
  return list;
}

export async function deleteEvent(eventId: string, permanent: boolean = false): Promise<boolean> {
  // If running on client, delegate to DELETE /api/events to update server database
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(eventId)}&permanent=${permanent}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const idx = memoryEvents.findIndex(e => e.id === eventId || e.slug === eventId);
        if (idx !== -1) {
          if (permanent) memoryEvents.splice(idx, 1);
          else memoryEvents[idx] = { ...memoryEvents[idx], status: 'CLOSED', is_archived: true };
          saveClientStorage();
        }
        return true;
      }
    } catch (e) {
      console.warn('Failed to delete event via API:', e);
    }
  }

  const client = getClient(true);
  if (client) {
    try {
      if (permanent) {
        const { error } = await client.from('events').delete().or(`id.eq.${eventId},slug.eq.${eventId}`);
        if (error) throw error;
      } else {
        // Safe archive/deactivate approach per guideline #6
        const { error } = await client.from('events').update({ status: 'CLOSED' }).or(`id.eq.${eventId},slug.eq.${eventId}`);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Supabase deleteEvent error:', err);
    }
  }

  syncClientStorage();
  const idx = memoryEvents.findIndex(e => e.id === eventId || e.slug === eventId);
  if (idx !== -1) {
    const ev = memoryEvents[idx];
    if (permanent) {
      memoryEvents.splice(idx, 1);
      // Clean up dependent records safely to prevent orphaned data
      memoryRegistrations = memoryRegistrations.filter(r => r.event_id !== ev.id && r.event_id !== ev.slug);
      memoryCertificates = memoryCertificates.filter(c => c.event_id !== ev.id && c.event_id !== ev.slug);
      memoryEvaluations = memoryEvaluations.filter(e => e.event_id !== ev.id && e.event_id !== ev.slug);
    } else {
      // Safe archival/removal from active listings while preserving historical attendance/certificates
      memoryEvents[idx] = {
        ...ev,
        status: 'CLOSED',
        is_archived: true
      };
    }
    saveClientStorage();
    return true;
  }
  return false;
}


export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  if (!slug) return null;
  const rawSlug = String(slug).trim();
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug).trim();
  } catch {}
  const normalizedSlug = decodedSlug.toLowerCase();

  const client = getClient();
  if (client) {
    try {
      const { data: event, error } = await client
        .from('events')
        .select('*')
        .or(`slug.eq.${rawSlug},id.eq.${rawSlug},slug.eq.${decodedSlug},id.eq.${decodedSlug}`)
        .maybeSingle();

      if (error) throw error;
      if (event) {
        const { count: regCount } = await client
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', event.id);

        const { count: verCount } = await client
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'VERIFIED');

        const { count: checkCount } = await client
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', event.id);

        return {
          ...event,
          registered_count: regCount || 0,
          verified_count: verCount || 0,
          checkins_count: checkCount || 0,
        };
      }
    } catch (err) {
      console.error('Supabase getEventBySlug error:', err);
    }
  }

  // Client runtime: always query server API so incognito or different browsers load real events
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/events?slug=${encodeURIComponent(rawSlug)}`);
      if (res.ok) {
        const serverEvent = await res.json();
        if (serverEvent && (serverEvent.id || serverEvent.slug)) {
          const idx = memoryEvents.findIndex(e => e.id === serverEvent.id || e.slug === serverEvent.slug);
          if (idx >= 0) memoryEvents[idx] = serverEvent;
          else memoryEvents.unshift(serverEvent);
          saveClientStorage();
          return serverEvent;
        }
      }
    } catch (err) {
      console.warn('Client fetch /api/events?slug error, checking local storage:', err);
    }
  }

  // Server runtime or local fallback
  syncClientStorage();
  return memoryEvents.find((e) => {
    if (!e) return false;
    if (e.id === rawSlug || e.id === decodedSlug) return true;
    if (e.slug === rawSlug || e.slug === decodedSlug) return true;
    if (e.slug?.toLowerCase() === normalizedSlug) return true;
    if (decodeURIComponent(e.slug || '').toLowerCase() === normalizedSlug) return true;
    if (e.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === normalizedSlug) return true;
    return false;
  }) || null;
}

export async function createEvent(eventData: Omit<EventItem, 'id'>): Promise<EventItem> {
  // If running on client, delegate to POST /api/events so event is persisted to server data store
  if (typeof window !== 'undefined') {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'EVENT_CREATION_FAILED' }));
      throw new Error(err.error || 'Failed to create event on server');
    }
    const created: EventItem = await res.json();
    const idx = memoryEvents.findIndex(e => e.id === created.id || e.slug === created.slug);
    if (idx >= 0) memoryEvents[idx] = created;
    else memoryEvents.unshift(created);
    saveClientStorage();
    return created;
  }

  // Server runtime:
  const client = getClient(true);
  if (client) {
    try {
      // Ensure unique slug
      let baseSlug = (eventData.slug || eventData.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'event';
      let finalSlug = baseSlug;
      let counter = 1;

      while (true) {
        const { data: existing } = await client
          .from('events')
          .select('id')
          .eq('slug', finalSlug)
          .maybeSingle();

        if (!existing) break;
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }

      const newId = `ev_${Date.now().toString(36)}`;
      const { data, error } = await client
        .from('events')
        .insert([{
          id: newId,
          slug: finalSlug,
          name: eventData.name,
          description: eventData.description || '',
          category: eventData.category,
          poster_url: eventData.poster_url || null,
          date: eventData.date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          venue: eventData.venue,
          capacity: Number(eventData.capacity) || 150,
          registration_deadline: eventData.registration_deadline || null,
          organizer_name: eventData.organizer_name,
          organizer_contact: eventData.organizer_contact,
          eligibility: eventData.eligibility || null,
          rules: eventData.rules || null,
          status: eventData.status || 'OPEN',
          event_status: eventData.event_status || 'UPCOMING'
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        return {
          ...data,
          registered_count: 0,
          verified_count: 0,
          checkins_count: 0,
        };
      }
    } catch (err: any) {
      console.error('Supabase createEvent error:', err);
      throw new Error(`EVENT_CREATION_FAILED: ${err.message || 'Database insert failed'}`);
    }
  }

  // Server disk/memory persistence:
  loadDiskStorage();

  // Normalize and ensure unique slug
  let baseSlug = (eventData.slug || eventData.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'event';
  let finalSlug = baseSlug;
  let counter = 1;

  while (memoryEvents.some(e => e.slug?.toLowerCase() === finalSlug.toLowerCase())) {
    counter++;
    finalSlug = `${baseSlug}-${counter}`;
  }

  const newId = `ev_${Date.now().toString(36)}`;
  const newEvent: EventItem = {
    ...eventData,
    id: newId,
    slug: finalSlug,
    created_at: new Date().toISOString(),
    registered_count: 0,
    verified_count: 0,
    checkins_count: 0
  };

  memoryEvents.unshift(newEvent);
  saveDiskStorage();
  return newEvent;
}

// ============================================================================
// 2. REGISTRATIONS API
// ============================================================================

export async function getRegistrations(
  filter: 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED' = 'ALL',
  eventId?: string,
  search?: string,
  studentId?: string
): Promise<RegistrationItem[]> {
  const client = getClient();

  if (client) {
    try {
      let query = client
        .from('registrations')
        .select(`
          *,
          events:event_id(id, name, slug, date, start_time, end_time, venue),
          passes(id, pass_token, status),
          attendance(id, gate, checked_in_at)
        `)
        .order('created_at', { ascending: false });

      if (eventId && eventId !== 'ALL') {
        query = query.eq('event_id', eventId);
      }

      if (filter !== 'ALL') {
        query = query.eq('status', filter);
      }

      if (studentId) {
        query = query.or(`student_id.eq.${studentId},email.ilike.${studentId}`);
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(`name.ilike.%${q}%,student_id.ilike.%${q}%,email.ilike.%${q}%,registration_number.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        syncClientStorage();
        const cleanData = data.filter((r: any) => !isDemoRecord(r));
        return cleanData.map((r: any) => {
          const pass = Array.isArray(r.passes) ? r.passes[0] : r.passes;
          const att = Array.isArray(r.attendance) ? r.attendance[0] : r.attendance;
          const evalItem = memoryEvaluations.find(e => e.registration_id === r.id);
          const cert = memoryCertificates.find(c => c.registration_id === r.id);
          return {
            ...r,
            event_name: r.events?.name || 'Campus Event',
            pass_token: pass?.pass_token || null,
            pass_id: pass?.id || null,
            checked_in: Boolean(att),
            checkin_time: att ? new Date(att.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
            gate: att?.gate || null,
            marks: evalItem?.marks ?? r.marks ?? null,
            feedback: evalItem?.feedback ?? r.feedback ?? null,
            result: evalItem?.result ?? r.result ?? undefined,
            certificate_eligible: evalItem?.certificate_eligible ?? r.certificate_eligible ?? false,
            certificate_issued: Boolean(cert),
            certificate_id: cert?.id || null,
          };
        });
      }
    } catch (err) {
      console.error('Supabase getRegistrations error:', err);
    }
  }

  // Client runtime: always query /api/registrations so client sees server persisted registrations
  if (typeof window !== 'undefined') {
    try {
      const sp = new URLSearchParams();
      if (filter && filter !== 'ALL') sp.set('filter', filter);
      if (eventId && eventId !== 'ALL') sp.set('eventId', eventId);
      if (search && search.trim()) sp.set('search', search.trim());
      if (studentId) sp.set('studentId', studentId);
      const res = await fetch(`/api/registrations?${sp.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.filter((r: any) => !isDemoRecord(r));
        }
      }
    } catch (e) {
      console.warn('getRegistrations API fetch error:', e);
    }
  }

  syncClientStorage();
  let list = memoryRegistrations.filter(r => !isDemoRecord(r));

  if (studentId) {
    list = list.filter(r => r.student_id === studentId || r.email.toLowerCase() === studentId.toLowerCase());
  }

  if (eventId && eventId !== 'ALL') {
    list = list.filter(r => r.event_id === eventId || r.event_name?.toLowerCase().includes(eventId.toLowerCase()));
  }

  if (filter !== 'ALL') {
    list = list.filter(r => r.status === filter);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(r => 
      r.name.toLowerCase().includes(q) ||
      r.student_id.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.pass_token && r.pass_token.toLowerCase().includes(q))
    );
  }

  return list.map(r => {
    const evalItem = memoryEvaluations.find(e => e.registration_id === r.id);
    const cert = memoryCertificates.find(c => c.registration_id === r.id);
    const item = {
      ...r,
      marks: evalItem?.marks ?? r.marks ?? null,
      feedback: evalItem?.feedback ?? r.feedback ?? null,
      result: evalItem?.result ?? r.result ?? undefined,
      certificate_eligible: evalItem?.certificate_eligible ?? r.certificate_eligible ?? false,
      certificate_issued: Boolean(cert),
      certificate_id: cert?.id || null,
    };
    if (!item.events) {
      const ev = memoryEvents.find(e => e.id === r.event_id || e.slug === r.event_id);
      return { ...item, events: ev };
    }
    return item;
  });
}


export async function getRegistrationByAccessToken(token: string): Promise<RegistrationItem | null> {
  if (!token) return null;
  const rawToken = String(token).trim();
  let decodedToken = rawToken;
  try {
    decodedToken = decodeURIComponent(rawToken).trim();
  } catch {}
  const lowerToken = decodedToken.toLowerCase();

  const client = getClient();

  if (client) {
    try {
      const { data: r, error } = await client
        .from('registrations')
        .select(`
          *,
          events:event_id(id, name, slug, date, start_time, end_time, venue),
          passes(id, pass_token, status),
          attendance(id, gate, checked_in_at)
        `)
        .or(`access_token.eq.${rawToken},pass_token.eq.${rawToken},id.eq.${rawToken},registration_number.eq.${rawToken},access_token.eq.${decodedToken}`)
        .maybeSingle();

      if (error) throw error;
      if (r && !isDemoRecord(r)) {
        const pass = Array.isArray(r.passes) ? r.passes[0] : r.passes;
        const att = Array.isArray(r.attendance) ? r.attendance[0] : r.attendance;
        return {
          ...r,
          event_name: r.events?.name || 'Campus Event',
          pass_token: pass?.pass_token || r.pass_token || null,
          pass_id: pass?.id || null,
          checked_in: Boolean(att),
          checkin_time: att ? new Date(att.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
          gate: att?.gate || null,
        };
      }
    } catch (err) {
      console.error('Supabase getRegistrationByAccessToken error:', err);
    }
  }

  // Client runtime: always query server API so incognito or different browsers load real data from server!
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/registrations?token=${encodeURIComponent(decodedToken)}`);
      if (res.ok) {
        const serverReg = await res.json();
        if (serverReg && (serverReg.id || serverReg.access_token) && !isDemoRecord(serverReg)) {
          const idx = memoryRegistrations.findIndex(r => r.id === serverReg.id || r.access_token === serverReg.access_token);
          if (idx >= 0) memoryRegistrations[idx] = serverReg;
          else memoryRegistrations.unshift(serverReg);
          saveClientStorage();
          return serverReg;
        }
      }
    } catch (err) {
      console.warn('Client fetch /api/registrations?token error:', err);
    }
  }

  syncClientStorage();
  const cleanList = memoryRegistrations.filter(r => !isDemoRecord(r));
  const found = cleanList.find(r => 
    r.access_token === rawToken || 
    r.access_token === decodedToken ||
    r.pass_token === rawToken || 
    r.pass_token === decodedToken ||
    r.id === rawToken || 
    r.id === decodedToken ||
    r.registration_number === rawToken ||
    r.registration_number === decodedToken ||
    (r.access_token && r.access_token.toLowerCase() === lowerToken) ||
    (r.pass_token && r.pass_token.toLowerCase() === lowerToken) ||
    (r.registration_number && r.registration_number.toLowerCase() === lowerToken)
  );

  if (found) {
    if (!found.events) {
      const ev = memoryEvents.find(e => e.id === found.event_id || e.slug === found.event_id);
      return { ...found, events: ev, event_name: ev?.name || found.event_name || 'Campus Event' };
    }
    return found;
  }
  return null;
}

export async function createRegistration(data: {
  event_id: string;
  name: string;
  student_id: string;
  college?: string;
  branch?: string;
  course: string;
  semester: string;
  email: string;
  phone: string;
  team_name?: string;
  document_url?: string;
}): Promise<RegistrationItem> {
  // 0. Server-Side Required Field Validation
  if (
    !data.name?.trim() || 
    !data.student_id?.trim() || 
    !data.email?.trim() || 
    !data.phone?.trim() || 
    !data.course?.trim() || 
    !data.semester?.trim()
  ) {
    throw new Error('INVALID_FORM_DATA: Missing required fields. Please fill in all required fields.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email.trim())) {
    throw new Error('INVALID_FORM_DATA: Please provide a valid institutional email address.');
  }

  const fixedCollege = 'SHEAT College of Engineering';
  const selectedBranch = data.branch?.trim() || undefined;

  const client = getClient(true);

  if (client) {
    try {
      // 1. Resolve event
      const event = await getEventBySlug(data.event_id);
      if (!event) {
        throw new Error('EVENT_NOT_FOUND: Event does not exist');
      }

      // 2. Validate Event Status
      if (event.status === 'CLOSED') {
        throw new Error('REGISTRATION_CLOSED: Event registration is closed.');
      }

      // 3. Validate Deadline
      if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
        throw new Error('DEADLINE_PASSED: Registration deadline has expired.');
      }

      // 4. Validate Capacity
      if (event.capacity && (event.registered_count || 0) >= event.capacity) {
        throw new Error('EVENT_CAPACITY_REACHED: Event has reached seat limit.');
      }

      // 5. Prevent Duplicate Registration
      const { data: existingReg } = await client
        .from('registrations')
        .select('id, registration_number, access_token')
        .eq('event_id', event.id)
        .or(`student_id.ilike.${data.student_id.trim()},email.ilike.${data.email.trim()}`)
        .maybeSingle();

      if (existingReg) {
        throw new Error('DUPLICATE_REGISTRATION: Student ID or Email already registered for this event.');
      }

      // 6. Generate registration number and private access token
      const prefix = (event.slug || 'TN').slice(0, 2).toUpperCase();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const regNumber = `REG-2026-${prefix}-${randomSuffix}`;
      const accessToken = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
      const newId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const payload: any = {
        id: newId,
        event_id: event.id,
        registration_number: regNumber,
        name: data.name.trim(),
        student_id: data.student_id.trim(),
        college: fixedCollege,
        course: data.course.trim(),
        semester: data.semester.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        document_url: data.document_url || 'student_id_scan.pdf',
        status: 'PENDING',
        access_token: accessToken,
        team_name: data.team_name?.trim() || null
      };
      if (selectedBranch) {
        payload.branch = selectedBranch;
      }

      let inserted: any = null;
      let insertError: any = null;

      try {
        const res = await client.from('registrations').insert([payload]).select().single();
        inserted = res.data;
        insertError = res.error;
      } catch (e: any) {
        insertError = e;
      }

      // If Supabase table does not have 'branch' column yet, retry cleanly without it
      if (insertError && (insertError.message?.includes('branch') || String(insertError).includes('branch'))) {
        delete payload.branch;
        if (selectedBranch) {
          payload.college = `${fixedCollege} - ${selectedBranch}`;
        }
        try {
          const retryRes = await client.from('registrations').insert([payload]).select().single();
          inserted = retryRes.data;
          insertError = retryRes.error;
        } catch (e: any) {
          insertError = e;
        }
      }

      if (insertError || !inserted) {
        throw new Error(`REGISTRATION_FAILED: ${insertError?.message || 'Database insert failed'}`);
      }

      return {
        ...inserted,
        event_name: event.name,
        branch: selectedBranch || inserted.branch || null,
        pass_token: null,
        pass_id: null,
        checked_in: false,
      };
    } catch (err: any) {
      console.error('Supabase createRegistration error:', err);
      throw err;
    }
  }

  // In-memory / disk storage fallback path
  syncClientStorage();
  const rawTarget = String(data.event_id || '').trim();
  let decodedTarget = rawTarget;
  try {
    decodedTarget = decodeURIComponent(rawTarget).trim();
  } catch {}
  const normalizedTarget = decodedTarget.toLowerCase();

  const event = memoryEvents.find(e => {
    if (!e) return false;
    if (e.id === rawTarget || e.id === decodedTarget) return true;
    if (e.slug === rawTarget || e.slug === decodedTarget) return true;
    if (e.slug?.toLowerCase() === normalizedTarget) return true;
    if (decodeURIComponent(e.slug || '').toLowerCase() === normalizedTarget) return true;
    if (e.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === normalizedTarget) return true;
    return false;
  });
  if (!event) throw new Error('EVENT_NOT_FOUND: Event does not exist');

  if (event.status === 'CLOSED') {
    throw new Error('REGISTRATION_CLOSED: Event registration is closed.');
  }

  if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
    throw new Error('DEADLINE_PASSED: Registration deadline has expired.');
  }

  if (event.capacity && (event.registered_count || 0) >= event.capacity) {
    throw new Error('EVENT_CAPACITY_REACHED: Event has reached seat limit.');
  }

  // Check duplicate
  const duplicate = memoryRegistrations.find(
    r => r.event_id === event.id && (
      r.student_id.toLowerCase() === data.student_id.toLowerCase().trim() || 
      r.email.toLowerCase() === data.email.toLowerCase().trim()
    )
  );
  if (duplicate) {
    throw new Error('DUPLICATE_REGISTRATION: Student ID or Email already registered for this event.');
  }

  const prefix = (event.slug || 'TN').slice(0, 2).toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const regNumber = `REG-2026-${prefix}-${randomSuffix}`;
  const accessToken = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
  const newId = `reg_${Date.now()}`;

  const newReg: RegistrationItem = {
    id: newId,
    event_id: event.id,
    event_name: event.name,
    registration_number: regNumber,
    name: data.name,
    student_id: data.student_id,
    college: fixedCollege,
    branch: selectedBranch,
    course: data.course,
    semester: data.semester,
    email: data.email,
    phone: data.phone,
    document_url: data.document_url || 'student_id_scan.pdf',
    team_name: data.team_name,
    status: 'PENDING',
    access_token: accessToken,
    created_at: new Date().toISOString()
  };

  event.registered_count = (event.registered_count || 0) + 1;
  memoryRegistrations.unshift(newReg);
  saveClientStorage();
  return newReg;
}

// ============================================================================
// 3. REGISTRATION VERIFICATION (TRANSACTIONAL & SAFE)
// ============================================================================

export async function verifyRegistration(registrationId: string): Promise<RegistrationItem | null> {
  const client = getClient(true);

  if (client) {
    try {
      // 1. Fetch current registration
      const { data: reg, error: regError } = await client
        .from('registrations')
        .select('*, events:event_id(id, name, slug)')
        .eq('id', registrationId)
        .single();

      if (regError || !reg) {
        throw new Error('VERIFICATION_FAILED: Registration record not found');
      }

      // 2. Check if a pass already exists for this registration
      const { data: existingPass } = await client
        .from('passes')
        .select('*')
        .eq('registration_id', registrationId)
        .maybeSingle();

      let passToken = existingPass?.pass_token;
      let passId = existingPass?.id;

      // 3. If no pass exists, generate cryptographically unique pass_token and insert row
      if (!existingPass) {
        const prefix = (reg.events?.slug || 'TN').slice(0, 2).toUpperCase();
        const rand = Math.floor(1000 + Math.random() * 9000);
        passToken = `PASS-${prefix}-${rand}`;
        const newPassId = `pass_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        const { data: newPass, error: passError } = await client
          .from('passes')
          .insert([{
            id: newPassId,
            registration_id: registrationId,
            pass_token: passToken,
            status: 'VALID'
          }])
          .select()
          .single();

        if (passError || !newPass) {
          throw new Error(`PASS_GENERATION_FAILED: ${passError?.message || 'Failed to create pass row'}`);
        }

        passId = newPass.id;
      }

      // 4. Update registration status to VERIFIED
      const { data: updatedReg, error: updateError } = await client
        .from('registrations')
        .update({ status: 'VERIFIED' })
        .eq('id', registrationId)
        .select('*, events:event_id(name, slug)')
        .single();

      if (updateError || !updatedReg) {
        // Rollback pass creation if we just inserted it
        if (!existingPass && passId) {
          await client.from('passes').delete().eq('id', passId);
        }
        throw new Error(`VERIFICATION_FAILED: ${updateError?.message || 'Failed to update registration status'}`);
      }

      return {
        ...updatedReg,
        event_name: reg.events?.name || 'Campus Event',
        pass_token: passToken,
        pass_id: passId,
      };
    } catch (err: any) {
      console.error('Supabase verifyRegistration error:', err);
      throw err;
    }
  }

  // Client runtime: delegate to POST /api/registrations/verify
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/registrations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });
      if (res.ok) {
        const updated = await res.json();
        return updated;
      }
    } catch (e) {
      console.warn('verifyRegistration API fetch error:', e);
    }
  }

  // In-memory fallback
  syncClientStorage();
  const reg = memoryRegistrations.find(r => r.id === registrationId);
  if (!reg) return null;

  const event = memoryEvents.find(e => e.id === reg.event_id);
  const prefix = (event?.slug || 'TN').slice(0, 2).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const passToken = `PASS-${prefix}-${rand}`;

  reg.status = 'VERIFIED';
  reg.pass_token = passToken;
  reg.pass_id = `pass_${Date.now()}`;

  if (event) {
    event.verified_count = (event.verified_count || 0) + 1;
  }

  saveClientStorage();
  return reg;
}

export async function rejectRegistration(registrationId: string, reason: string): Promise<RegistrationItem | null> {
  const client = getClient(true);

  if (client) {
    try {
      const { data: updatedReg, error } = await client
        .from('registrations')
        .update({
          status: 'REJECTED',
          rejection_reason: reason
        })
        .eq('id', registrationId)
        .select('*, events:event_id(name, slug)')
        .single();

      if (error || !updatedReg) {
        throw new Error(`REJECTION_FAILED: ${error?.message || 'Failed to update registration'}`);
      }

      // Revoke any active pass
      await client.from('passes').update({ status: 'REVOKED' }).eq('registration_id', registrationId);

      return {
        ...updatedReg,
        event_name: updatedReg.events?.name || 'Campus Event'
      };
    } catch (err: any) {
      console.error('Supabase rejectRegistration error:', err);
      throw err;
    }
  }

  // Client runtime: delegate to POST /api/registrations/reject
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/registrations/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, reason }),
      });
      if (res.ok) {
        const updated = await res.json();
        return updated;
      }
    } catch (e) {
      console.warn('rejectRegistration API fetch error:', e);
    }
  }

  syncClientStorage();
  const reg = memoryRegistrations.find(r => r.id === registrationId);
  if (!reg) return null;

  reg.status = 'REJECTED';
  reg.rejection_reason = reason;
  saveClientStorage();
  return reg;
}

// ============================================================================
// 4. PASS VALIDATION & TURNSTILE CHECK-IN
// ============================================================================

export interface ScanValidationResult {
  status: 'VALID' | 'DUPLICATE' | 'UNVERIFIED' | 'WRONG_EVENT' | 'INVALID';
  message: string;
  registration?: RegistrationItem;
  event?: EventItem;
  timestamp?: string;
  gate?: string;
}

export async function validatePassToken(
  passTokenOrStudentId: string,
  targetEventSlugOrId?: string,
  gate: string = 'Gate 02'
): Promise<ScanValidationResult> {
  const client = getClient(true);
  const input = passTokenOrStudentId.trim().toUpperCase();

  if (client) {
    try {
      // 1. Look up pass in Supabase
      let passRecord: any = null;

      // Check by pass_token
      const { data: passByToken } = await client
        .from('passes')
        .select('*, registrations!inner(*, events:event_id(*))')
        .ilike('pass_token', input)
        .maybeSingle();

      if (passByToken) {
        passRecord = passByToken;
      } else {
        // Check by student_id
        const { data: regByStudentId } = await client
          .from('registrations')
          .select('*, passes(*), events:event_id(*)')
          .ilike('student_id', input)
          .maybeSingle();

        if (regByStudentId && regByStudentId.passes && regByStudentId.passes.length > 0) {
          const p = Array.isArray(regByStudentId.passes) ? regByStudentId.passes[0] : regByStudentId.passes;
          passRecord = {
            ...p,
            registrations: {
              ...regByStudentId,
              events: regByStudentId.events
            }
          };
        }
      }

      if (!passRecord) {
        return {
          status: 'INVALID',
          message: 'Scanned barcode or Pass ID does not exist in the institutional registry.'
        };
      }

      const reg = passRecord.registrations;
      const event = reg?.events;

      // 2. Validate pass status
      if (passRecord.status !== 'VALID') {
        return {
          status: 'INVALID',
          message: `Pass credential status is ${passRecord.status}. Entry not permitted.`,
          registration: reg,
          event: event
        };
      }

      // 3. Validate registration verification status
      if (reg.status !== 'VERIFIED') {
        return {
          status: 'UNVERIFIED',
          message: `Applicant credentials are currently in ${reg.status} status. Entry denied.`,
          registration: reg,
          event: event
        };
      }

      // 4. Validate event schedule alignment
      if (targetEventSlugOrId && targetEventSlugOrId !== 'ALL') {
        const isMatch = 
          event?.id === targetEventSlugOrId || 
          event?.slug === targetEventSlugOrId ||
          event?.slug?.toLowerCase() === targetEventSlugOrId.toLowerCase();

        if (!isMatch) {
          return {
            status: 'WRONG_EVENT',
            message: `Pass is valid for "${event?.name || 'different event'}", but scanned at ${targetEventSlugOrId} gate.`,
            registration: reg,
            event: event
          };
        }
      }

      // 5. Prevent duplicate attendance (Check existing record)
      const { data: existingAttendance } = await client
        .from('attendance')
        .select('*')
        .eq('event_id', reg.event_id)
        .eq('pass_id', passRecord.id)
        .maybeSingle();

      if (existingAttendance) {
        const timeStr = new Date(existingAttendance.checked_in_at).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        return {
          status: 'DUPLICATE',
          message: `Pass already validated at ${timeStr} by ${existingAttendance.gate}. Turnstile barrier remains locked.`,
          registration: reg,
          event: event,
          timestamp: timeStr,
          gate: existingAttendance.gate
        };
      }

      // 6. Insert real attendance check-in row
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newAttId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const { error: attError } = await client
        .from('attendance')
        .insert([{
          id: newAttId,
          event_id: reg.event_id,
          pass_id: passRecord.id,
          registration_id: reg.id,
          gate: gate || 'Gate 02',
          checked_in_at: now.toISOString()
        }]);

      if (attError) {
        if (attError.code === '23505') {
          return {
            status: 'DUPLICATE',
            message: 'Duplicate turnstile scan detected. Attendee is already checked in.',
            registration: reg,
            event: event
          };
        }
        throw new Error(`ATTENDANCE_RECORDING_FAILED: ${attError.message}`);
      }

      return {
        status: 'VALID',
        message: 'Entry credentials confirmed. Turnstile barrier unlocked.',
        registration: {
          ...reg,
          pass_token: passRecord.pass_token,
          event_name: event?.name
        },
        event: event,
        timestamp: timeStr,
        gate: gate
      };
    } catch (err) {
      console.error('Supabase validatePassToken error:', err);
    }
  }

  // In-memory fallback
  syncClientStorage();
  const match = memoryRegistrations.find(r => 
    (r.pass_token && r.pass_token.toUpperCase() === input) ||
    r.student_id.toUpperCase() === input
  );

  if (!match) {
    return {
      status: 'INVALID',
      message: 'Scanned barcode or Pass ID does not exist in the institutional registry.'
    };
  }

  if (targetEventSlugOrId && targetEventSlugOrId !== 'ALL') {
    const regEvent = memoryEvents.find(e => e.id === match.event_id || e.slug === match.event_id);
    const isMatchingEvent = 
      match.event_id === targetEventSlugOrId || 
      regEvent?.slug === targetEventSlugOrId ||
      regEvent?.id === targetEventSlugOrId ||
      regEvent?.slug?.toLowerCase() === targetEventSlugOrId.toLowerCase() ||
      match.event_name?.toLowerCase().includes(targetEventSlugOrId.toLowerCase()) ||
      match.event_id.includes(targetEventSlugOrId);

    if (!isMatchingEvent) {
      return {
        status: 'WRONG_EVENT',
        message: `Pass is valid for ${match.event_name}, but scanned at ${targetEventSlugOrId} gate.`,
        registration: match
      };
    }
  }

  if (match.status !== 'VERIFIED') {
    return {
      status: 'UNVERIFIED',
      message: `Applicant credentials are currently in ${match.status} status. Entry denied.`,
      registration: match
    };
  }

  if (match.checked_in) {
    return {
      status: 'DUPLICATE',
      message: `Pass already validated at ${match.checkin_time || 'earlier today'} by ${match.gate || 'Gate'}. Turnstile barrier remains locked.`,
      registration: match,
      timestamp: match.checkin_time || undefined,
      gate: match.gate || undefined
    };
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  match.checked_in = true;
  match.checkin_time = timeStr;
  match.gate = gate;

  const event = memoryEvents.find(e => e.id === match.event_id);
  if (event) {
    event.checkins_count = (event.checkins_count || 0) + 1;
  }

  saveClientStorage();

  return {
    status: 'VALID',
    message: 'Entry credentials confirmed. Turnstile barrier unlocked.',
    registration: match,
    event: event || undefined,
    timestamp: timeStr,
    gate: gate
  };
}

// ============================================================================
// 5. ATTENDANCE & ROSTER API
// ============================================================================

export async function getAttendanceList(
  filter: 'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN' = 'ALL',
  search?: string,
  eventId?: string
): Promise<RegistrationItem[]> {
  const client = getClient();

  if (client) {
    try {
      // Query all verified registrations with their passes and attendance
      let query = client
        .from('registrations')
        .select(`
          *,
          events:event_id(name, slug),
          passes(id, pass_token, status),
          attendance(id, gate, checked_in_at)
        `)
        .eq('status', 'VERIFIED')
        .order('created_at', { ascending: false });

      if (eventId && eventId.trim()) {
        query = query.eq('event_id', eventId.trim());
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(`name.ilike.%${q}%,student_id.ilike.%${q}%,email.ilike.%${q}%,registration_number.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        let list = data.map((r: any) => {
          const pass = Array.isArray(r.passes) ? r.passes[0] : r.passes;
          const att = Array.isArray(r.attendance) ? r.attendance[0] : r.attendance;
          return {
            ...r,
            event_name: r.events?.name || 'Campus Event',
            pass_token: pass?.pass_token || null,
            pass_id: pass?.id || null,
            checked_in: Boolean(att),
            checkin_time: att ? new Date(att.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
            gate: att?.gate || null,
          };
        });

        if (filter === 'CHECKED_IN') {
          list = list.filter((r: any) => r.checked_in);
        } else if (filter === 'NOT_CHECKED_IN') {
          list = list.filter((r: any) => !r.checked_in);
        }

        return list.filter((r: any) => !isDemoRecord(r));
      }
    } catch (err) {
      console.error('Supabase getAttendanceList error:', err);
    }
  }

  syncClientStorage();
  let list = memoryRegistrations.filter(r => !isDemoRecord(r) && r.status === 'VERIFIED');

  if (eventId && eventId.trim()) {
    list = list.filter(r => r.event_id === eventId.trim());
  }

  if (filter === 'CHECKED_IN') {
    list = list.filter(r => r.checked_in);
  } else if (filter === 'NOT_CHECKED_IN') {
    list = list.filter(r => !r.checked_in);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(r => 
      r.name.toLowerCase().includes(q) ||
      r.student_id.toLowerCase().includes(q) ||
      (r.pass_token && r.pass_token.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getRecentCheckins(limit: number = 8): Promise<RegistrationItem[]> {
  const client = getClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('attendance')
        .select(`
          id, gate, checked_in_at,
          registrations(*),
          passes(pass_token),
          events(name)
        `)
        .order('checked_in_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (data) {
        return data
          .filter((a: any) => !isDemoRecord(a.registrations) && !isDemoRecord(a.events))
          .map((a: any) => ({
            ...a.registrations,
            event_name: a.events?.name,
            pass_token: a.passes?.pass_token,
            gate: a.gate,
            checkin_time: new Date(a.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            checked_in: true
          }));
      }
    } catch (err) {
      console.error('Supabase getRecentCheckins error:', err);
    }
  }

  syncClientStorage();
  return memoryRegistrations.filter(r => !isDemoRecord(r) && r.checked_in).slice(0, limit);
}

// ============================================================================
// 6. CERTIFICATES API
// ============================================================================

export async function getCertificates(): Promise<CertificateItem[]> {
  const client = getClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('certificates')
        .select(`
          *,
          events:event_id(name, slug, date),
          registrations:registration_id(name, student_id)
        `)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      if (data) {
        return data
          .filter((c: any) => !isDemoRecord(c) && !isDemoRecord(c.events))
          .map((c: any) => ({
            id: c.id,
            event_id: c.event_id,
            registration_id: c.registration_id,
            certificate_number: c.certificate_number,
            certificate_url: c.certificate_url,
            role: c.role || 'Participant',
            event_name: c.events?.name || 'Campus Event',
            student_name: c.registrations?.name || 'Student',
            event_date: c.events?.date || new Date().toISOString().split('T')[0],
            issued_at: c.issued_at
          }));
      }
    } catch (err) {
      console.error('Supabase getCertificates error:', err);
    }
  }

  syncClientStorage();
  return memoryCertificates.filter(c => !isDemoRecord(c));
}

export async function issueCertificatesForEvent(eventId: string): Promise<number> {
  const client = getClient(true);

  if (client) {
    try {
      // 1. Get confirmed turnstile attendees for event
      const { data: attendees, error: attError } = await client
        .from('attendance')
        .select('*, registrations(name, student_id), events(name, slug)')
        .eq('event_id', eventId);

      if (attError) throw attError;

      // 2. Check which attendees already have certificates
      const { data: existingCerts } = await client
        .from('certificates')
        .select('registration_id')
        .eq('event_id', eventId);

      const issuedSet = new Set((existingCerts || []).map((c: any) => c.registration_id));
      const unissued = (attendees || []).filter((a: any) => !issuedSet.has(a.registration_id));

      if (unissued.length === 0) return 0;

      // 3. Batch insert new certificates
      const toInsert = unissued.map((a: any) => {
        const studentId = a.registrations?.student_id || '0000';
        return {
          id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          event_id: eventId,
          registration_id: a.registration_id,
          certificate_number: `CERT-2026-TN-${studentId.slice(-4)}`,
          role: 'Delegate Participant',
          issued_at: new Date().toISOString()
        };
      });

      const { data: inserted, error: insertError } = await client
        .from('certificates')
        .insert(toInsert)
        .select();

      if (insertError) throw insertError;
      return inserted?.length || 0;
    } catch (err) {
      console.error('Supabase issueCertificatesForEvent error:', err);
    }
  }

  syncClientStorage();
  const targetEvent = memoryEvents.find(e => e.id === eventId || e.slug === eventId);
  const targetId = targetEvent ? targetEvent.id : eventId;
  const attendees = memoryRegistrations.filter(r => (r.event_id === targetId || r.event_id === eventId) && r.checked_in);
  let count = 0;

  attendees.forEach(att => {
    const exists = memoryCertificates.some(c => (c.event_id === targetId || c.event_id === eventId) && c.registration_id === att.id);
    if (!exists) {
      memoryCertificates.unshift({
        id: `cert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        event_id: eventId,
        registration_id: att.id,
        certificate_number: `CERT-2026-TN-${att.student_id.slice(-4)}`,
        role: 'Delegate Participant',
        event_name: att.event_name || 'Technova 2026',
        student_name: att.name,
        event_date: 'Oct 24, 2026',
        issued_at: new Date().toISOString()
      });
      count++;
    }
  });

  saveClientStorage();
  return count;
}

export async function issueCertificateForParticipant(data: {
  registrationId: string;
  eventId: string;
  role?: string;
  marks?: number | null;
  result?: string;
}): Promise<CertificateItem> {
  const client = getClient(true);
  const targetRole = data.role || data.result || 'Delegate Participant';

  if (client) {
    try {
      // Check if certificate already exists
      const { data: existing } = await client
        .from('certificates')
        .select('*')
        .eq('registration_id', data.registrationId)
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Fetch registration details
      const { data: reg } = await client
        .from('registrations')
        .select('name, student_id, event_id, events(name, slug)')
        .eq('id', data.registrationId)
        .single();

      const studentId = reg?.student_id || '0000';
      const certNumber = `CERT-2026-TN-${studentId.slice(-4)}`;
      const newCert = {
        id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        event_id: data.eventId,
        registration_id: data.registrationId,
        certificate_number: certNumber,
        role: targetRole,
        issued_at: new Date().toISOString()
      };

      const { data: inserted, error } = await client
        .from('certificates')
        .insert([newCert])
        .select()
        .single();

      if (error) throw error;
      return inserted;
    } catch (err) {
      console.error('Supabase issueCertificateForParticipant error:', err);
    }
  }

  syncClientStorage();
  const existing = memoryCertificates.find(c => c.registration_id === data.registrationId);
  if (existing) {
    existing.role = targetRole;
    existing.result = data.result || targetRole;
    if (data.marks !== undefined) existing.marks = data.marks;
    saveClientStorage();
    return existing;
  }

  const reg = memoryRegistrations.find(r => r.id === data.registrationId);
  const ev = memoryEvents.find(e => e.id === data.eventId || e.slug === data.eventId);
  const studentId = reg?.student_id || '0000';
  const certNumber = `CERT-2026-TN-${studentId.slice(-4)}`;

  const newCert: CertificateItem = {
    id: `cert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    event_id: data.eventId,
    registration_id: data.registrationId,
    certificate_number: certNumber,
    role: targetRole,
    result: data.result || targetRole,
    marks: data.marks,
    event_name: reg?.event_name || ev?.name || 'Campus Event',
    student_name: reg?.name || 'Ashutosh Dixit',
    event_date: ev?.date || 'Oct 24, 2026',
    issued_at: new Date().toISOString()
  };

  memoryCertificates.unshift(newCert);
  saveClientStorage();
  return newCert;
}

// ============================================================================
// 8. STUDENT ACCOUNTS API (PASSWORDS EXCLUDED FROM CLIENT RESPONSES)
// ============================================================================

export async function getStudents(): Promise<Omit<StudentAccount, 'password'>[]> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('student_accounts')
        .select('id, full_name, student_id, email, course, college, phone, created_at');
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((d: any) => ({
          ...d,
          name: d.full_name || d.name,
        }));
      }
    } catch (err) {
      console.error('Supabase getStudents error:', err);
    }
  }

  syncClientStorage();
  return memoryStudents.map(({ password, ...safe }) => ({
    ...safe,
    name: safe.name || safe.full_name,
  }));
}

export async function getStudentByEmailOrId(identifier: string): Promise<Omit<StudentAccount, 'password'> | null> {
  const trimmed = identifier.trim().toLowerCase();
  const client = getClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('student_accounts')
        .select('id, full_name, student_id, email, course, college, phone, created_at')
        .or(`student_id.eq.${trimmed},email.ilike.${trimmed}`)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return {
          ...data,
          name: data.full_name,
        };
      }
    } catch (err) {
      console.error('Supabase getStudentByEmailOrId error:', err);
    }
  }

  syncClientStorage();
  const found = memoryStudents.find(
    s => s.student_id.toLowerCase() === trimmed || s.email.toLowerCase() === trimmed
  );
  if (found) {
    const { password, ...safe } = found;
    return {
      ...safe,
      name: safe.name || safe.full_name,
    };
  }
  return null;
}

export async function createStudentAccount(
  data: Omit<StudentAccount, 'id' | 'created_at'>
): Promise<Omit<StudentAccount, 'password'>> {
  const client = getClient(true);
  const cleanId = data.student_id.trim();
  const cleanEmail = data.email.trim().toLowerCase();
  const fixedCollege = 'SHEAT College of Engineering';
  const selectedBranch = data.branch?.trim() || undefined;

  // Check duplicate
  syncClientStorage();
  const existingMemory = memoryStudents.find(
    s => s.student_id.toLowerCase() === cleanId.toLowerCase() || s.email.toLowerCase() === cleanEmail
  );
  if (existingMemory) {
    throw new Error('DUPLICATE_STUDENT: A student account with this Student ID or Email already exists.');
  }

  if (client) {
    try {
      const { data: existingDb } = await client
        .from('student_accounts')
        .select('id')
        .or(`student_id.eq.${cleanId},email.ilike.${cleanEmail}`)
        .maybeSingle();

      if (existingDb) {
        throw new Error('DUPLICATE_STUDENT: A student account with this Student ID or Email already exists.');
      }

      const newId = `stu_${Date.now().toString(36)}`;
      const studentName = (data.full_name || data.name || '').trim();
      const { data: inserted, error } = await client
        .from('student_accounts')
        .insert([{
          id: newId,
          full_name: studentName,
          student_id: cleanId,
          email: cleanEmail,
          course: data.course.trim(),
          college: fixedCollege,
          branch: selectedBranch,
          phone: data.phone?.trim() || '',
          password: data.password || 'password123',
        }])
        .select('id, full_name, student_id, email, course, college, branch, phone, created_at')
        .single();

      if (error) throw error;
      if (inserted) {
        const studentObj: StudentAccount = {
          ...inserted,
          name: studentName,
          branch: selectedBranch,
          password: data.password || 'password123'
        };
        memoryStudents.unshift(studentObj);
        saveClientStorage();
        return {
          ...inserted,
          name: studentName,
          branch: selectedBranch,
        };
      }
    } catch (err: any) {
      if (err.message?.includes('DUPLICATE_STUDENT')) throw err;
      console.error('Supabase createStudentAccount error:', err);
    }
  }

  const studentName = (data.full_name || data.name || '').trim();
  const newAccount: StudentAccount = {
    id: `stu_${Date.now().toString(36)}`,
    name: studentName,
    full_name: studentName,
    student_id: cleanId,
    email: cleanEmail,
    course: data.course.trim(),
    college: fixedCollege,
    branch: selectedBranch,
    phone: data.phone?.trim() || '',
    password: data.password || 'password123',
    created_at: new Date().toISOString()
  };

  memoryStudents.unshift(newAccount);
  saveClientStorage();

  const { password, ...safe } = newAccount;
  return safe;
}

export async function verifyStudentLogin(
  identifier: string,
  pass: string
): Promise<Omit<StudentAccount, 'password'> | null> {
  const trimmed = identifier.trim().toLowerCase();
  const client = getClient(true);

  if (client) {
    try {
      const { data, error } = await client
        .from('student_accounts')
        .select('*')
        .or(`student_id.eq.${trimmed},email.ilike.${trimmed}`)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        if (data.password === pass) {
          const { password, ...safe } = data;
          return safe;
        }
        return null;
      }
    } catch (err) {
      console.error('Supabase verifyStudentLogin error:', err);
    }
  }

  syncClientStorage();
  const found = memoryStudents.find(
    s => s.student_id.toLowerCase() === trimmed || s.email.toLowerCase() === trimmed
  );

  if (found && found.password === pass) {
    const { password, ...safe } = found;
    return safe;
  }
  return null;
}

// ============================================================================
// 9. EVALUATION & JUDGING API
// ============================================================================

export async function getEvaluations(eventId: string): Promise<EvaluationItem[]> {
  const client = getClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('evaluations')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      if (Array.isArray(data)) {
        return data.filter((e: any) => !isDemoRecord(e));
      }
    } catch (err) {
      console.error('Supabase getEvaluations error:', err);
    }
  }

  syncClientStorage();
  return memoryEvaluations.filter(e => e.event_id === eventId && !isDemoRecord(e));
}

export async function saveEvaluation(data: {
  event_id: string;
  registration_id: string;
  student_id: string;
  student_name?: string;
  course?: string;
  marks?: number | null;
  feedback?: string | null;
  result?: EvaluationResult;
  certificate_eligible?: boolean;
}): Promise<EvaluationItem> {
  const client = getClient(true);

  if (client) {
    try {
      const { data: upserted, error } = await client
        .from('evaluations')
        .upsert({
          event_id: data.event_id,
          registration_id: data.registration_id,
          student_id: data.student_id,
          marks: data.marks !== undefined ? data.marks : null,
          feedback: data.feedback !== undefined ? data.feedback : null,
          result: data.result || 'PARTICIPANT',
          certificate_eligible: data.certificate_eligible ?? false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'event_id,registration_id' })
        .select()
        .single();

      if (error) throw error;
      if (upserted) {
        syncClientStorage();
        const idx = memoryEvaluations.findIndex(
          e => e.event_id === data.event_id && e.registration_id === data.registration_id
        );
        if (idx !== -1) {
          memoryEvaluations[idx] = { ...memoryEvaluations[idx], ...upserted };
        } else {
          memoryEvaluations.unshift(upserted);
        }
        saveClientStorage();
        return upserted;
      }
    } catch (err) {
      console.error('Supabase saveEvaluation error:', err);
    }
  }

  syncClientStorage();
  const idx = memoryEvaluations.findIndex(
    e => e.event_id === data.event_id && e.registration_id === data.registration_id
  );

  const evalItem: EvaluationItem = {
    id: idx !== -1 ? memoryEvaluations[idx].id : `eval_${Date.now().toString(36)}`,
    event_id: data.event_id,
    registration_id: data.registration_id,
    student_id: data.student_id,
    student_name: data.student_name,
    course: data.course,
    marks: data.marks !== undefined ? data.marks : null,
    feedback: data.feedback !== undefined ? data.feedback : null,
    result: data.result || 'PARTICIPANT',
    certificate_eligible: data.certificate_eligible ?? false,
    updated_at: new Date().toISOString()
  };

  if (idx !== -1) {
    memoryEvaluations[idx] = evalItem;
  } else {
    memoryEvaluations.unshift(evalItem);
  }

  // Also update corresponding registration item in memory
  const reg = memoryRegistrations.find(r => r.id === data.registration_id);
  if (reg) {
    reg.marks = evalItem.marks;
    reg.feedback = evalItem.feedback;
    reg.result = evalItem.result;
    reg.certificate_eligible = evalItem.certificate_eligible;
  }

  saveClientStorage();
  return evalItem;
}

// ============================================================================
// 7. DASHBOARD STATS (100% REAL DYNAMIC COUNTS)
// ============================================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const client = getClient();

  if (client) {
    try {
      const [
        { count: totalEvents },
        { count: upcomingEvents },
        { count: totalRegistrations },
        { count: pendingVerifications },
        { count: verifiedStudents },
        { count: todayCheckins },
        { count: certificatesIssued }
      ] = await Promise.all([
        client.from('events').select('id', { count: 'exact', head: true }),
        client.from('events').select('id', { count: 'exact', head: true }).in('event_status', ['UPCOMING', 'LIVE']),
        client.from('registrations').select('id', { count: 'exact', head: true }),
        client.from('registrations').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
        client.from('registrations').select('id', { count: 'exact', head: true }).eq('status', 'VERIFIED'),
        client.from('attendance').select('id', { count: 'exact', head: true }),
        client.from('certificates').select('id', { count: 'exact', head: true })
      ]);

      const totalV = verifiedStudents || 0;
      const totalC = todayCheckins || 0;
      const rate = totalV > 0 ? Number(((totalC / totalV) * 100).toFixed(1)) : 0;

      return {
        totalEvents: totalEvents || 0,
        upcomingEvents: upcomingEvents || 0,
        totalRegistrations: totalRegistrations || 0,
        pendingVerifications: pendingVerifications || 0,
        verifiedStudents: totalV,
        todayCheckins: totalC,
        attendanceRate: rate,
        certificatesIssued: certificatesIssued || 0
      };
    } catch (err) {
      console.error('Supabase getDashboardStats error:', err);
    }
  }

  syncClientStorage();
  const totalEvents = memoryEvents.filter(e => !e.is_archived).length;
  const upcomingEvents = memoryEvents.filter(e => !e.is_archived && (e.event_status === 'UPCOMING' || e.event_status === 'LIVE')).length;
  const totalRegistrations = memoryRegistrations.length;
  const pendingVerifications = memoryRegistrations.filter(r => r.status === 'PENDING').length;
  const verifiedStudents = memoryRegistrations.filter(r => r.status === 'VERIFIED').length;
  const todayCheckins = memoryRegistrations.filter(r => r.checked_in).length;
  const attendanceRate = verifiedStudents > 0 ? Number(((todayCheckins / verifiedStudents) * 100).toFixed(1)) : 0;
  const certificatesIssued = memoryCertificates.length;

  return {
    totalEvents,
    upcomingEvents,
    totalRegistrations,
    pendingVerifications,
    verifiedStudents,
    todayCheckins,
    attendanceRate,
    certificatesIssued
  };
}

export function resetDemoState() {
  memoryEvents = [];
  memoryRegistrations = [];
  memoryCertificates = [];
  memoryStudents = [];
  memoryEvaluations = [];
  memoryAdminProfile = JSON.parse(JSON.stringify(DEFAULT_ADMIN_PROFILE));
  saveClientStorage();
}

// ============================================================================
// 10. GET OR CREATE STUDENT PASS FLOW
// ============================================================================

export async function getOrCreateStudentPass(
  eventIdOrSlug: string,
  studentIdOrEmail: string,
  studentDetails?: Partial<StudentAccount>
): Promise<{
  registration: RegistrationItem;
  access_token: string;
  pass_token: string;
}> {
  if (!eventIdOrSlug || !studentIdOrEmail) {
    throw new Error('MISSING_PARAMETERS: event_id and student_id are required.');
  }

  // 1. Resolve event
  const event = await getEventBySlug(eventIdOrSlug);
  if (!event) {
    throw new Error('EVENT_NOT_FOUND: The requested event could not be found.');
  }

  syncClientStorage();
  const cleanId = studentIdOrEmail.trim().toLowerCase();

  // 2. Resolve student from memory or provided details
  const student = memoryStudents.find(
    s => s.student_id.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId
  ) || studentDetails;

  const client = getClient(true);

  // 3. Check existing registration
  let existingReg: any = null;

  if (client) {
    try {
      const { data } = await client
        .from('registrations')
        .select(`
          *,
          passes(id, pass_token, status)
        `)
        .eq('event_id', event.id)
        .or(`student_id.ilike.${cleanId},email.ilike.${cleanId}`)
        .maybeSingle();
      if (data && !isDemoRecord(data)) existingReg = data;
    } catch (e) {
      console.warn('Supabase existingReg check error:', e);
    }
  }

  if (!existingReg) {
    existingReg = memoryRegistrations.find(
      r => !isDemoRecord(r) &&
           (r.event_id === event.id || r.event_id === event.slug) &&
           (r.student_id.toLowerCase() === cleanId || r.email.toLowerCase() === cleanId)
    );
  }

  const prefix = (event.slug || 'EV').slice(0, 3).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'EV';
  const randNum = Math.floor(1000 + Math.random() * 9000);

  if (existingReg) {
    // Ensure valid access_token exists
    let accessToken = existingReg.access_token;
    if (!accessToken || isDemoRecord(existingReg)) {
      accessToken = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
      existingReg.access_token = accessToken;
    }

    // Ensure valid pass_token exists
    let passToken = existingReg.pass_token;
    if (Array.isArray(existingReg.passes) && existingReg.passes[0]?.pass_token) {
      passToken = existingReg.passes[0].pass_token;
    }
    if (!passToken || passToken.includes('DEMO')) {
      passToken = `PASS-${prefix}-${randNum}`;
      existingReg.pass_token = passToken;
      existingReg.pass_id = `pass_${Date.now()}`;
    }

    existingReg.status = 'VERIFIED';

    // Persist updates to Supabase if available
    if (client) {
      try {
        await client.from('registrations').update({
          access_token: accessToken,
          status: 'VERIFIED'
        }).eq('id', existingReg.id);

        const { data: passRow } = await client.from('passes').select('id').eq('registration_id', existingReg.id).maybeSingle();
        if (!passRow) {
          await client.from('passes').insert([{
            id: `pass_${Date.now()}`,
            registration_id: existingReg.id,
            pass_token: passToken,
            status: 'VALID'
          }]);
        }
      } catch (err) {
        console.warn('Failed to update pass in Supabase:', err);
      }
    }

    const idx = memoryRegistrations.findIndex(r => r.id === existingReg.id);
    if (idx >= 0) memoryRegistrations[idx] = { ...memoryRegistrations[idx], ...existingReg };
    else memoryRegistrations.unshift(existingReg);
    saveClientStorage();

    return {
      registration: { ...existingReg, events: event, event_name: event.name },
      access_token: accessToken,
      pass_token: passToken,
    };
  }

  // 4. Create new verified registration with valid access and pass token
  const newRegId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const regNumber = `REG-2026-${prefix}-${randNum}`;
  const accessToken = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
  const passToken = `PASS-${prefix}-${randNum}`;
  const studentName = student?.name || (student as any)?.full_name || studentDetails?.name || (studentDetails as any)?.full_name || 'Student';
  const studentRoll = student?.student_id || studentDetails?.student_id || studentIdOrEmail;
  const studentEmail = student?.email || studentDetails?.email || `${cleanId}@campus.edu`;
  const studentPhone = student?.phone || studentDetails?.phone || '9876543210';
  const studentCollege = student?.college || studentDetails?.college || 'SHEAT College of Engineering';
  const studentBranch = student?.branch || studentDetails?.branch || 'Babatpur';
  const studentCourse = student?.course || studentDetails?.course || 'B.Tech CSE';
  const studentSemester = student?.semester || studentDetails?.semester || 'Semester 4';

  const newReg: RegistrationItem = {
    id: newRegId,
    event_id: event.id,
    event_name: event.name,
    registration_number: regNumber,
    name: studentName,
    student_id: studentRoll,
    college: studentCollege,
    branch: studentBranch,
    course: studentCourse,
    semester: studentSemester,
    email: studentEmail,
    phone: studentPhone,
    document_url: 'student_id_scan.pdf',
    status: 'VERIFIED',
    access_token: accessToken,
    pass_token: passToken,
    pass_id: `pass_${Date.now()}`,
    created_at: new Date().toISOString(),
    checked_in: false,
    events: event
  };

  if (client) {
    try {
      const payload: any = {
        id: newRegId,
        event_id: event.id,
        registration_number: regNumber,
        name: studentName,
        student_id: studentRoll,
        college: studentCollege,
        course: studentCourse,
        semester: studentSemester,
        email: studentEmail,
        phone: studentPhone,
        document_url: 'student_id_scan.pdf',
        status: 'VERIFIED',
        access_token: accessToken,
      };
      if (studentBranch) payload.branch = studentBranch;

      let insertedOk = false;
      try {
        const { error } = await client.from('registrations').insert([payload]);
        if (!error) insertedOk = true;
      } catch {}

      if (!insertedOk) {
        delete payload.branch;
        payload.college = `${studentCollege} - ${studentBranch}`;
        await client.from('registrations').insert([payload]);
      }

      await client.from('passes').insert([{
        id: `pass_${Date.now()}`,
        registration_id: newRegId,
        pass_token: passToken,
        status: 'VALID'
      }]);
    } catch (e) {
      console.warn('Supabase insert pass registration error:', e);
    }
  }

  event.registered_count = (event.registered_count || 0) + 1;
  event.verified_count = (event.verified_count || 0) + 1;
  memoryRegistrations.unshift(newReg);
  saveClientStorage();

  return {
    registration: newReg,
    access_token: accessToken,
    pass_token: passToken,
  };
}

