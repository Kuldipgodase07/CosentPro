'use strict';
// Server-side hash chain. Same canonical string as the browser verifier in the app,
// so an auditor can recompute every hash in their own browser.
const crypto = require('crypto');

const ZERO = '0'.repeat(64);
const canon = (e) => [e.seq, e.ts, e.type, e.org, e.purpose, e.subject, e.receipt, e.prev].join('|');
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const pad = (n) => String(n).padStart(6, '0');

/** Append one entry inside an existing Firestore transaction. Returns the stored entry. */
async function appendLedger(db, tx, tid, entry) {
  const metaRef = db.doc(`tenants/${tid}/meta/ledger`);
  const meta = (await tx.get(metaRef)).data() || { seq: 0, head: ZERO };
  const e = { ts: Date.now(), ...entry, seq: meta.seq + 1, prev: meta.head };
  e.hash = sha256(canon(e));
  tx.set(db.doc(`tenants/${tid}/ledger/${pad(e.seq)}`), e);
  tx.set(metaRef, { seq: e.seq, head: e.hash });
  return e;
}

/** Recompute the whole chain. Returns the first break, if any. */
async function verifyChain(db, tid) {
  const snap = await db.collection(`tenants/${tid}/ledger`).orderBy('seq').get();
  let prev = ZERO, breaks = [];
  snap.forEach((d) => {
    const e = d.data();
    if (e.prev !== prev || sha256(canon(e)) !== e.hash) breaks.push(e.seq);
    prev = e.hash;
  });
  return { ok: breaks.length === 0, count: snap.size, breaks: breaks.slice(0, 20) };
}

module.exports = { appendLedger, verifyChain, canon, sha256, ZERO };
