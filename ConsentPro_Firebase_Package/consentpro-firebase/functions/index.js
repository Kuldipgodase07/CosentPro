'use strict';
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { appendLedger, verifyChain, sha256 } = require('./lib/ledger');
const gemini = require('./lib/ai');

admin.initializeApp();
const db = admin.firestore();
setGlobalOptions({ region: 'asia-south1', maxInstances: 20 });

const STAFF = ['dpo', 'dev', 'auditor', 'admin'];
const need = (req, roles) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  if (roles && !roles.includes(req.auth.token.role)) throw new HttpsError('permission-denied', 'Your role cannot do this.');
  return req.auth;
};
const callOpts = { enforceAppCheck: true };

/* ---------- consent: the only path that changes a consent or the ledger ---------- */
exports.recordConsent = onCall(callOpts, async (req) => {
  const a = need(req);
  const { tid, purposeId, action } = req.data || {};
  if (!tid || !purposeId || !['grant', 'revoke'].includes(action)) throw new HttpsError('invalid-argument', 'tid, purposeId and action are required.');
  const pSnap = await db.doc(`tenants/${tid}/purposes/${purposeId}`).get();
  if (!pSnap.exists) throw new HttpsError('not-found', 'Unknown purpose.');
  const p = pSnap.data(), receipt = 'RC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const hooks = action === 'revoke' ? await db.collection(`tenants/${tid}/webhooks`).get() : { docs: [] };
  const entry = await db.runTransaction(async (tx) => {
    tx.set(db.doc(`principals/${a.uid}/consents/${purposeId}`), { purpose: p.name, org: tid, status: action === 'grant' ? 'granted' : 'revoked', receipt, updated: Date.now() });
    const e = await appendLedger(db, tx, tid, { type: action === 'grant' ? 'GRANT' : 'REVOKE', org: tid, purpose: p.name, subject: a.uid, receipt });
    hooks.docs.forEach((h) => tx.set(db.collection(`tenants/${tid}/outbox`).doc(), { hook: h.id, url: h.data().url, event: 'consent.' + (action === 'grant' ? 'granted' : 'revoked'), receipt, subject: a.uid, purpose: p.name, ts: Date.now(), attempts: 0 }));
    return e;
  });
  return { receipt, seq: entry.seq, hash: entry.hash };
});

exports.verifyChain = onCall(callOpts, async (req) => {
  need(req, ['auditor', 'dpo', 'admin', 'dev']);
  return verifyChain(db, req.data.tid);
});

exports.setRole = onCall(callOpts, async (req) => {
  need(req, ['admin']);
  const { uid, role, tenant } = req.data || {};
  if (!['principal', 'dpo', 'dev', 'auditor', 'admin'].includes(role)) throw new HttpsError('invalid-argument', 'Unknown role.');
  await admin.auth().setCustomUserClaims(uid, { role, tenant });
  await db.doc(`users/${uid}`).set({ role, tenant }, { merge: true });
  return { ok: true };
});

/* ---------- SDK endpoint: one call before using personal data ---------- */
exports.verifyConsent = onRequest({ cors: true }, async (req, res) => {
  const key = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!key.startsWith('cp_live_') && !key.startsWith('cp_test_')) return res.status(401).json({ error: 'missing_key' });
  const k = await db.collectionGroup('apiKeys').where('hash', '==', sha256(key)).where('status', '==', 'active').limit(1).get();
  if (k.empty) return res.status(401).json({ error: 'invalid_key' });
  const tid = k.docs[0].ref.parent.parent.id, { subject, purpose } = req.body || {};
  if (!subject || !purpose) return res.status(400).json({ error: 'subject_and_purpose_required' });
  const c = await db.collection(`principals/${subject}/consents`).where('purpose', '==', purpose).where('org', '==', tid).limit(1).get();
  const d = c.empty ? null : c.docs[0].data();
  res.json({ allowed: !!d && d.status === 'granted', receipt: d ? d.receipt : null, checkedAt: Date.now() });
});

/* ---------- revocation fan-out: signed webhooks ---------- */
exports.deliverWebhook = onDocumentCreated('tenants/{tid}/outbox/{id}', async (event) => {
  const d = event.data.data(), secret = process.env.WEBHOOK_SECRET || 'change-me';
  const body = JSON.stringify({ event: d.event, receipt: d.receipt, subject: d.subject, purpose: d.purpose, ts: d.ts });
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');
  try {
    const r = await fetch(d.url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-consentpro-signature': sig }, body });
    await event.data.ref.update({ status: r.ok ? 'delivered' : 'failed', code: r.status, attempts: d.attempts + 1 });
  } catch (e) {
    await event.data.ref.update({ status: 'failed', error: String(e.message).slice(0, 200), attempts: d.attempts + 1 });
  }
});

/* ---------- Gemini ---------- */
const aiFn = (fn, roles) => onCall({ ...callOpts, timeoutSeconds: 60 }, async (req) => {
  need(req, roles);
  try { return await fn(req.data || {}); } catch (e) { console.error(e); throw new HttpsError('internal', 'The AI service could not answer. Try again.'); }
});
exports.aiLint = aiFn(gemini.lint, ['dpo', 'dev', 'admin']);
exports.aiTriage = aiFn(gemini.triage, ['dpo', 'admin']);
exports.aiAdvise = aiFn(gemini.advise, ['dpo', 'admin']);
