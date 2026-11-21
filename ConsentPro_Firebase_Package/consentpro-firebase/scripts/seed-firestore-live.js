/**
 * Live Firestore Seeder for ConsentPro
 * Populates tenants, purposes, ledger, requests, apiKeys, config, and users
 * directly into the Cloud Firestore Database via REST API.
 */
const https = require('https');
const crypto = require('crypto');

const PROJECT_ID = 'consentpro-e50f7';
const API_KEY = 'AIzaSyCLpTusWvhexmkFV474i3fili3GYucPcrc';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestore(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestore) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestore(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function writeDoc(docPath, data) {
  return new Promise((resolve, reject) => {
    const fields = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) fields[k] = toFirestore(v);
    }
    const payload = JSON.stringify({ fields });
    const url = `${BASE_URL}/${docPath}?key=${API_KEY}`;
    
    const req = https.request(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✓ Written: ${docPath}`);
          resolve(JSON.parse(body));
        } else {
          console.error(`✗ Error writing ${docPath}: [${res.statusCode}] ${body}`);
          reject(new Error(body));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function sha(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function canon(e) {
  return [e.seq, e.prev, e.ts, e.type, e.org, e.purpose, e.subject, e.receipt].join('|');
}

async function main() {
  console.log(`Starting Firestore Seeding on ${PROJECT_ID}...`);

  const NOW = Date.now();
  const DAY = 86400000;

  // 1. Tenant
  await writeDoc('tenants/orbit', {
    name: 'Orbit Bank',
    plan: 'Growth',
    region: 'asia-south1',
    description: 'Universal Retail & Digital Banking Tenant',
    updated: NOW
  });

  // 2. Settings Config
  await writeDoc('tenants/orbit/config/settings', {
    dpo: 'Meera Nair',
    dpoMail: 'dpo@orbitbank.example',
    mfa: true,
    timeout: 30,
    retention: '12 months',
    langs: ['en', 'hi', 'ta', 'bn'],
    region: 'Mumbai · asia-south1',
    compliance_framework: 'DPDP Act 2023 & GDPR',
    updated: NOW
  });

  // 3. Purposes
  const PURPOSES = [
    { id: 'o1', org: 'orbit', name: 'Credit scoring with alternative data', desc: 'Uses bank statements and utility payments to offer you a fairer credit limit.', data: ['Bank statements', 'Utility payments'], ret: 'Until loan closure + 3 years', status: 'granted', exp: NOW + 210 * DAY, kw: ['credit', 'score', 'scoring', 'loan'], receipt: 'RC-9F2A41C7' },
    { id: 'o2', org: 'orbit', name: 'Product offers by SMS and email', desc: 'Sends offers that match how you bank. Never shared outside Orbit Bank.', data: ['Name', 'Contact details', 'Spend categories'], ret: '12 months', status: 'granted', exp: NOW + 120 * DAY, kw: ['marketing', 'offers', 'sms', 'email', 'promotions'], receipt: 'RC-8B3120AA' },
    { id: 'o3', org: 'orbit', name: 'Fraud pattern analytics', desc: 'Checks unusual activity on your account to stop fraud early.', data: ['Device ID', 'Transaction metadata'], ret: '24 months', status: 'granted', exp: NOW + 300 * DAY, kw: ['fraud', 'security'], receipt: 'RC-31FF50C1' },
    { id: 'o4', org: 'orbit', name: 'Sharing with insurance partners', desc: 'Lets two insurance partners quote you from your income band.', data: ['Name', 'Income band'], ret: '6 months', status: 'revoked', exp: 0, kw: ['insurance', 'partners'], receipt: 'RC-00E4A19B' },
    { id: 'm1', org: 'medi', name: 'Appointment reminders', desc: 'Reminds you about visits and follow-ups by SMS.', data: ['Contact details', 'Appointment times'], ret: '12 months', status: 'granted', exp: NOW + 90 * DAY, kw: ['reminders', 'appointment', 'sms'], receipt: 'RC-54C198E2' },
    { id: 'm2', org: 'medi', name: 'Records shared with referred specialists', desc: 'Sends your reports to a specialist only when your doctor refers you.', data: ['Diagnosis summary', 'Lab reports'], ret: 'Until the referral ends', status: 'granted', exp: NOW + 60 * DAY, kw: ['records', 'specialist', 'referral', 'reports'], receipt: 'RC-6C20A381' },
    { id: 'm3', org: 'medi', name: 'Wellness newsletters', desc: 'Monthly health tips tailored to your age group.', data: ['Name', 'Age band'], ret: '12 months', status: 'granted', exp: NOW - 6 * DAY, kw: ['newsletter', 'wellness', 'tips'], receipt: 'RC-11D09E44' },
    { id: 's1', org: 'swift', name: 'Personalised recommendations', desc: 'Suggests products from what you browse and buy.', data: ['Browsing history', 'Purchase history'], ret: '12 months', status: 'granted', exp: NOW + 19 * DAY, kw: ['recommendations', 'personalised', 'personalized'], receipt: 'RC-77C18440' },
    { id: 's2', org: 'swift', name: 'Delivery partner location sharing', desc: 'Shares your address and phone with the courier for one delivery.', data: ['Address', 'Phone number'], ret: 'Until delivery', status: 'granted', exp: NOW + 30 * DAY, kw: ['delivery', 'courier', 'location'], receipt: 'RC-42FA109E' },
    { id: 's3', org: 'swift', name: 'Ad measurement with third parties', desc: 'Lets ad networks measure whether their ads led to a purchase.', data: ['Device ID', 'Purchase events'], ret: '13 months', status: 'revoked', exp: 0, kw: ['ads', 'advertising', 'measurement', 'third'], receipt: 'RC-998AE001' },
    { id: 't1', org: 'telco', name: 'Personalised plan recommendations', desc: 'Uses how much data and talk time you use to suggest cheaper plans.', data: ['Usage summary'], ret: '12 months', status: 'pending', exp: 0, kw: ['plans', 'recommendations'], receipt: 'RC-B10893FA' },
    { id: 't2', org: 'telco', name: 'Network analytics for service quality', desc: 'Uses network data from your phone to find and fix call drops.', data: ['Cell tower data', 'Signal strength'], ret: '6 months', status: 'pending', exp: 0, kw: ['network', 'analytics', 'quality'], receipt: 'RC-E47701CD' }
  ];

  for (const p of PURPOSES) {
    await writeDoc(`tenants/orbit/purposes/${p.id}`, { ...p, updated: NOW });
  }

  // 4. Rights Requests
  const REQUESTS = [
    { id: 'RQ-1041', type: 'Access', by: 'dp_2b91c4', text: 'Wants a copy of the data held for credit scoring.', ts: NOW - 6 * DAY, due: NOW + 24 * DAY, status: 'In progress' },
    { id: 'RQ-1042', type: 'Erasure', by: 'dp_88e3f0', text: 'Asks to delete marketing history after revoking offers.', ts: NOW - 3 * DAY, due: NOW + 27 * DAY, status: 'Open' },
    { id: 'RQ-1043', type: 'Correction', by: 'dp_51ad07', text: 'Mobile number on file is out of date.', ts: NOW - 1 * DAY, due: NOW + 29 * DAY, status: 'Open' },
    { id: 'RQ-1038', type: 'Grievance', by: 'dp_c7720a', text: 'Offers kept arriving two days after revoking.', ts: NOW - 15 * DAY, due: NOW + 15 * DAY, status: 'Resolved' }
  ];

  for (const r of REQUESTS) {
    await writeDoc(`tenants/orbit/requests/${r.id}`, r);
  }

  // 5. API Keys
  const KEYS = [
    { id: 'k1', name: 'Production web checkout', prefix: 'cp_live_7f3a', scopes: ['verify', 'receipts:write'], created: NOW - 41 * DAY, last: '2 min ago', status: 'active' },
    { id: 'k2', name: 'Mobile app (Android)', prefix: 'cp_live_c19e', scopes: ['verify'], created: NOW - 19 * DAY, last: '8 min ago', status: 'active' }
  ];

  for (const k of KEYS) {
    await writeDoc(`tenants/orbit/apiKeys/${k.id}`, k);
  }

  // 6. Users
  const USERS = [
    { uid: 'aarav', name: 'Aarav Mehta', email: 'aarav@example.com', role: 'principal', status: 'Active', mfa: false, tenant: null },
    { uid: 'meera', name: 'Meera Nair', email: 'meera@orbitbank.example', role: 'dpo', status: 'Active', mfa: true, tenant: 'orbit' },
    { uid: 'kabir', name: 'Kabir Shah', email: 'kabir@orbitbank.example', role: 'dev', status: 'Active', mfa: true, tenant: 'orbit' },
    { uid: 'rhea', name: 'Rhea D’Souza', email: 'rhea@auditfirm.example', role: 'auditor', status: 'Active', mfa: true, tenant: 'orbit' },
    { uid: 'neha', name: 'Neha Kapoor', email: 'neha@orbitbank.example', role: 'admin', status: 'Active', mfa: true, tenant: 'orbit' }
  ];

  for (const u of USERS) {
    await writeDoc(`users/${u.uid}`, { ...u, updated: NOW });
  }

  // 7. Hash-chained Ledger Blocks (Sample of first 20 chained entries)
  let prev = '0'.repeat(64);
  const ledgerTypes = ['GRANT', 'NOTICE', 'VERIFY', 'GRANT', 'REVOKE', 'VERIFY'];
  for (let seq = 1; seq <= 20; seq++) {
    const p = PURPOSES[seq % PURPOSES.length];
    const type = ledgerTypes[seq % ledgerTypes.length];
    const ts = NOW - (25 - seq) * 3600000;
    const receipt = 'RC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const entry = {
      seq,
      prev,
      ts,
      type,
      org: p.org,
      purpose: p.name,
      subject: 'dp_7c41e2',
      receipt
    };
    const hash = sha(canon(entry));
    entry.hash = hash;
    const docId = String(seq).padStart(6, '0');
    await writeDoc(`tenants/orbit/ledger/${docId}`, entry);
    prev = hash;
  }

  console.log('✅ ALL COLLECTIONS AND DOCUMENTS SUCCESSFULLY WRITTEN TO FIRESTORE!');
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
