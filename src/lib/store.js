/* ──────────────────────────────────────────────
   Delhi RoadWatch — localStorage Store
   Replaces Supabase for zero-config demo mode
   ────────────────────────────────────────────── */

const P = 'rw_';

// ── Seed Data ──────────────────────────────────────────────────────────────

const SEED = {
  users: [
    { user_id: 'u001', name: 'Arjun Sharma', email: 'arjun@demo.com', phone: '9876543210', aadhaar: '123456789012', aadhaar_verified: true, password_hash: 'citizen123', role: 'citizen' },
    { user_id: 'u002', name: 'Priya Kapoor', email: 'priya@demo.com', phone: '9876543211', aadhaar: '234567890123', aadhaar_verified: true, password_hash: 'citizen123', role: 'citizen' },
  ],
  police: [
    { police_id: 'POL001', name: 'Inspector Rajesh Kumar', email: 'rajesh@delhi.police.gov.in', phone: '9811000001', password_hash: 'police123', role: 'police' },
    { police_id: 'POL002', name: 'SI Meena Devi', email: 'meena@delhi.police.gov.in', phone: '9811000002', password_hash: 'police123', role: 'police' },
  ],
  admins: [
    { admin_id: 'ADM001', name: 'Traffic Admin', email: 'admin@roadwatch.gov.in', phone: '9811000003', password_hash: 'admin123', role: 'admin' },
  ],
  vehicles: [
    { number_plate: 'DL01AB1234', owner_name: 'Rahul Verma', phone_number: '9876501001', make: 'Maruti Swift', model: 'LXI', color: 'White', insurance_valid_till: '2026-12-31' },
    { number_plate: 'DL2CAB5678', owner_name: 'Sunita Gupta', phone_number: '9876501002', make: 'Honda City', model: 'SV', color: 'Silver', insurance_valid_till: '2025-06-30' },
    { number_plate: 'DL4CAF9012', owner_name: 'Vikram Malhotra', phone_number: '9876501003', make: 'Hyundai i20', model: 'Asta', color: 'Blue', insurance_valid_till: '2027-03-15' },
    { number_plate: 'HR26DQ5588', owner_name: 'Manish Kumar', phone_number: '9876501004', make: 'Tata Nexon', model: 'XZ', color: 'Red', insurance_valid_till: '2025-12-01' },
    { number_plate: 'UP16AT4321', owner_name: 'Deepak Yadav', phone_number: '9876501005', make: 'Bajaj Pulsar', model: '150', color: 'Black', insurance_valid_till: '2026-04-20' },
    { number_plate: 'MH12AB3456', owner_name: 'Pooja Patel', phone_number: '9876501006', make: 'Maruti Baleno', model: 'Alpha', color: 'Orange', insurance_valid_till: '2027-01-10' },
    { number_plate: 'DL10CG7890', owner_name: 'Sanjay Mehta', phone_number: '9876501007', make: 'Volkswagen Polo', model: 'Comfortline', color: 'Brown', insurance_valid_till: '2025-08-15' },
    { number_plate: 'DL7CB3456', owner_name: 'Anjali Sharma', phone_number: '9876501008', make: 'Toyota Innova', model: 'GX', color: 'Grey', insurance_valid_till: '2026-09-01' },
  ],
  reports: [],
  ai_analysis: [],
  case_status: [],
  notifications: [],
  violations: [],
};

// ── Init (idempotent — runs once per browser) ──────────────────────────────

export function initStore() {
  if (localStorage.getItem(P + 'seeded')) return;
  for (const [table, rows] of Object.entries(SEED)) {
    localStorage.setItem(P + table, JSON.stringify(rows));
  }
  localStorage.setItem(P + 'seeded', '1');
}

// ── Generic CRUD ───────────────────────────────────────────────────────────

export function getAll(table) {
  try { return JSON.parse(localStorage.getItem(P + table) || '[]'); }
  catch { return []; }
}

export function setAll(table, rows) {
  localStorage.setItem(P + table, JSON.stringify(rows));
}

export function dbInsert(table, row) {
  const rows = getAll(table);
  rows.push(row);
  setAll(table, rows);
  return row;
}

export function dbUpdate(table, pred, updates) {
  const rows = getAll(table);
  const i = rows.findIndex(pred);
  if (i === -1) return null;
  rows[i] = { ...rows[i], ...updates };
  setAll(table, rows);
  return rows[i];
}

export function dbRemove(table, pred) {
  setAll(table, getAll(table).filter(r => !pred(r)));
}

export function dbFind(table, pred) {
  return getAll(table).find(pred) ?? null;
}

export function dbFilter(table, pred) {
  return getAll(table).filter(pred);
}
