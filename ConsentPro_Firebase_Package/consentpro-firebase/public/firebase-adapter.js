// Starter wiring between the ConsentPro front end and Firebase.
// Loaded after the app. It keeps the app's UI state and replaces the demo back end with:
//   - Cloud Functions for consent changes and Gemini calls,
//   - Firestore for rights requests and ledger hydration.
// Sign-in screens still use the demo accounts. Wire them to signInWithEmailAndPassword next (see README).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, setDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';

const cfg = window.CP_FIREBASE_CONFIG;
if (!cfg || cfg.apiKey.startsWith('YOUR_')) {
  console.info('ConsentPro: Firebase config not set. Running in demo mode.');
} else {
  const app = initializeApp(cfg), auth = getAuth(app), fs = getFirestore(app), fn = getFunctions(app, cfg.region);
  const tid = cfg.tenant;
  CP_CONFIG.firebase = true; CP_CONFIG.project = cfg.projectId; CP_CONFIG.region = cfg.region; DB.tid = tid;

  // 1. Gemini through callable functions
  const names = { lint: 'aiLint', triage: 'aiTriage', advise: 'aiAdvise' };
  AI.call = async (name, payload) => {
    const t0 = performance.now();
    const body = name === 'advise' ? { obligations: obligations() } : payload;
    const r = await httpsCallable(fn, names[name])(body);
    DB.fn++; DB.log('call', 'functions/' + names[name], 0);
    return { out: r.data, engine: CP_CONFIG.model, ms: Math.round(performance.now() - t0) };
  };

  // 2. Consent changes go through the server, which writes the ledger in one transaction
  const localApply = window.applyConsent;
  window.applyConsent = function (id, action) {
    const receipt = localApply(id, action);
    httpsCallable(fn, 'recordConsent')({ tid, purposeId: id, action }).catch((e) => toast('Server could not record this: ' + e.message));
    return receipt;
  };

  // 3. Rights requests are written by the person, allowed by the rules
  const origPush = S.requests.push.bind(S.requests);
  S.requests.push = (...rs) => { rs.forEach((r) => setDoc(doc(fs, `tenants/${tid}/requests/${r.id}`), r).catch(console.error)); return origPush(...rs); };

  // 4. Hydrate the ledger after sign-in so auditors see server history
  onAuthStateChanged(auth, async (u) => {
    if (!u) return;
    try {
      const snap = await getDocs(query(collection(fs, `tenants/${tid}/ledger`), orderBy('seq')));
      if (snap.size) { S.ledger.length = 0; snap.forEach((d) => S.ledger.push(d.data())); if (S.route === 'a-ledger') render(); }
    } catch (e) { console.warn('Ledger not readable for this role', e.code); }
  });
}
