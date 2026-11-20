/**
 * Production Firebase Adapter Connector
 * Automatically switches the app from demo store to live Firebase
 * when window.CP_FIREBASE_CONFIG is provided.
 */
import { S, CP_CONFIG, obligations } from '../core/state.js';
import { DB } from './firestore-db.js';
import { AI } from './ai-engine.js';
import { applyConsent } from './ledger.js';
import { toast } from '../components/ui/toast.js';

export async function initFirebaseAdapter(renderAppCallback) {
  const cfg = window.CP_FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('YOUR_')) {
    console.info('ConsentPro: Firebase config not set or placeholder detected. Operating in high-fidelity in-browser store mode.');
    return;
  }

  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
    const { getFirestore, doc, setDoc, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
    const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js');

    const app = initializeApp(cfg);
    const auth = getAuth(app);
    const fs = getFirestore(app);
    const fn = getFunctions(app, cfg.region);
    const tid = cfg.tenant || 'orbit';

    CP_CONFIG.firebase = true;
    CP_CONFIG.project = cfg.projectId;
    CP_CONFIG.region = cfg.region;
    DB.tid = tid;

    // 1. Gemini through Cloud Functions
    const names = { lint: 'aiLint', triage: 'aiTriage', advise: 'aiAdvise' };
    AI.call = async (name, payload) => {
      const t0 = performance.now();
      const body = name === 'advise' ? { obligations: obligations() } : payload;
      const r = await httpsCallable(fn, names[name])(body);
      DB.fn++;
      DB.log('call', 'functions/' + names[name], 0);
      return { out: r.data, engine: CP_CONFIG.model, ms: Math.round(performance.now() - t0) };
    };

    // 2. Consent changes go through cloud function with atomic ledger transaction
    const localApply = applyConsent;
    window.applyConsent = function (id, action) {
      const receipt = localApply(id, action);
      httpsCallable(fn, 'recordConsent')({ tid, purposeId: id, action })
        .catch(e => toast('Server could not record this: ' + e.message));
      return receipt;
    };

    // 3. Rights requests synced to Firestore
    const origPush = S.requests.push.bind(S.requests);
    S.requests.push = (...rs) => {
      rs.forEach(r => setDoc(doc(fs, `tenants/${tid}/requests/${r.id}`), r).catch(console.error));
      return origPush(...rs);
    };

    // 4. Hydrate ledger from Firestore
    onAuthStateChanged(auth, async u => {
      if (!u) return;
      try {
        const snap = await getDocs(query(collection(fs, `tenants/${tid}/ledger`), orderBy('seq')));
        if (snap.size) {
          S.ledger.length = 0;
          snap.forEach(d => S.ledger.push(d.data()));
          if (S.route === 'a-ledger' && renderAppCallback) renderAppCallback();
        }
      } catch (e) {
        console.warn('Ledger not readable for this role', e.code);
      }
    });

    console.info('ConsentPro: Firebase Adapter successfully connected to project:', cfg.projectId);
  } catch (err) {
    console.warn('ConsentPro: Firebase adapter load skipped or offline:', err.message);
  }
}
