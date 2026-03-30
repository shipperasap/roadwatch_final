/* ──────────────────────────────────────────────
   Delhi RoadWatch — Database Layer (localStorage)
   ────────────────────────────────────────────── */

import { getAll, dbInsert, dbUpdate, dbRemove, dbFind, dbFilter } from '../lib/store';

// ── Constants ──────────────────────────────────────────────────────────────

export const CRIME_TYPES = [
  'Signal Jumping',
  'Illegal Parking',
  'No Helmet',
  'Triple Riding',
  'Wrong Side Driving',
  'Overspeeding',
  'Dangerous Driving',
  'Blocking Road',
  'Other',
];

export const STATUS = {
  SUBMITTED:       'Submitted',
  AI_PROCESSED:    'AI Processed',
  ADMIN_ACCEPTED:  'Admin Accepted',
  ADMIN_REJECTED:  'Admin Rejected',
  POLICE_CONFIRMED:'Police Confirmed',
  OWNER_NOTIFIED:  'Owner Notified',
};

let _counter = Date.now();
export function nextReportId() {
  return `RPT-${++_counter}`;
}

// ── AUTH ───────────────────────────────────────────────────────────────────

export async function loginCitizen(email, password) {
  const user = dbFind('users', u => u.email === email && u.password_hash === password);
  if (!user) return { success: false, error: 'Invalid email or password.' };
  return { success: true, user: { ...user, role: 'citizen', user_id: user.user_id } };
}

export async function loginPolice(policeId, password) {
  const user = dbFind('police', u => u.police_id === policeId && u.password_hash === password);
  if (!user) return { success: false, error: 'Invalid Police ID or password.' };
  return { success: true, user: { ...user, role: 'police', user_id: user.police_id } };
}

export async function loginAdmin(adminId, password) {
  const user = dbFind('admins', u => u.admin_id === adminId && u.password_hash === password);
  if (!user) return { success: false, error: 'Invalid Admin ID or password.' };
  return { success: true, user: { ...user, role: 'admin', user_id: user.admin_id } };
}

export async function signupCitizen(name, email, phone, aadhaar, password) {
  if (dbFind('users', u => u.email === email)) {
    return { success: false, error: 'Email already registered.' };
  }
  const user = dbInsert('users', {
    user_id: `u${Date.now()}`,
    name, email, phone,
    aadhaar,
    aadhaar_verified: true,
    password_hash: password,
    role: 'citizen',
  });
  return { success: true, user: { ...user, role: 'citizen' } };
}

// ── REPORTS ────────────────────────────────────────────────────────────────

export async function createReport(report) {
  dbInsert('reports', report);
  dbInsert('case_status', {
    report_id: report.report_id,
    admin_status: report.reported_by === 'police' ? 'accepted' : null,
    police_status: report.reported_by === 'police' ? 'confirmed' : null,
    notification_sent: false,
  });
  return report;
}

export async function fetchReports(filters = {}) {
  let rows = getAll('reports');
  if (filters.citizen_id)  rows = rows.filter(r => r.citizen_id  === filters.citizen_id);
  if (filters.status)      rows = rows.filter(r => r.status      === filters.status);
  if (filters.reported_by) rows = rows.filter(r => r.reported_by === filters.reported_by);
  return rows.sort((a, b) => new Date(b.submission_time) - new Date(a.submission_time));
}

export async function updateReportStatus(reportId, newStatus) {
  dbUpdate('reports', r => r.report_id === reportId, { status: newStatus });
}

export async function deleteReport(reportId) {
  dbRemove('ai_analysis',  r => r.report_id === reportId);
  dbRemove('case_status',  r => r.report_id === reportId);
  dbRemove('notifications',r => r.report_id === reportId);
  dbRemove('reports',      r => r.report_id === reportId);
}

// Compress image to base64; videos get an object URL (in-session only)
export async function uploadEvidence(file) {
  if (file.type.startsWith('image/')) return compressToBase64(file);
  return URL.createObjectURL(file);
}

async function compressToBase64(file, maxWidth = 900, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(URL.createObjectURL(file));
    img.src = URL.createObjectURL(file);
  });
}

// ── AI ANALYSIS ────────────────────────────────────────────────────────────

export async function saveAiAnalysis(analysis) {
  return dbInsert('ai_analysis', analysis);
}

export async function fetchAiAnalysis(reportId) {
  return dbFind('ai_analysis', a => a.report_id === reportId);
}

export async function fetchAllAiAnalysis() {
  return getAll('ai_analysis');
}

// ── VAHAAN VEHICLE REGISTRY ────────────────────────────────────────────────

export async function lookupVehicle(numberPlate) {
  const plate = (numberPlate || '').toUpperCase().replace(/\s/g, '');
  return dbFind('vehicles', v => v.number_plate.replace(/\s/g, '') === plate);
}

export async function fetchAllVehicles() {
  return getAll('vehicles');
}

// ── CASE STATUS ────────────────────────────────────────────────────────────

export async function updateCaseStatus(reportId, updates) {
  dbUpdate('case_status', r => r.report_id === reportId, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────

export async function createNotification(notification) {
  return dbInsert('notifications', {
    ...notification,
    id: `notif_${Date.now()}`,
    sent_at: new Date().toISOString(),
  });
}

export async function fetchNotifications() {
  return getAll('notifications').sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
}

// ── VIOLATIONS (shown to violators on login) ───────────────────────────────

export async function createViolation(violation) {
  return dbInsert('violations', {
    ...violation,
    id: `v_${Date.now()}`,
    created_at: new Date().toISOString(),
  });
}

export async function fetchViolationsForUser(phone) {
  return dbFilter('violations', v => v.violator_phone === phone)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function fetchViolationsByEmail(email) {
  const user = dbFind('users', u => u.email === email);
  if (!user) return [];
  return fetchViolationsForUser(user.phone);
}
