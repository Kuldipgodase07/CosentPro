/**
 * Production Firebase Adapter Connector
 * Automatically synchronizes with live Cloud Firestore when window.CP_FIREBASE_CONFIG is present.
 */
import { S, CP_CONFIG, obligations } from '../core/state.js';
import { DB } from './firestore-db.js';
import { AI } from './ai-engine.js';
import { applyConsent } from './ledger.js';
import { toast } from '../components/ui/toast.js';

export async function initFirebaseAdapter(renderAppCallback) {
  const cfg = window.CP_FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('YOUR_')) {
    console.info('ConsentPro: Operating in high-fidelity in-browser store mode.');
    return;
  }

  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
    const { getFirestore, doc, setDoc, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');

    const app = initializeApp(cfg);
    const fs = getFirestore(app);
    const tid = cfg.tenant || 'orbit';

    CP_CONFIG.firebase = true;
    CP_CONFIG.project = cfg.projectId;
    CP_CONFIG.region = cfg.region;
    DB.tid = tid;

    // 1. Intercept Consent changes and write directly to Firestore (Purposes & Hash-Chained Ledger)
    const localApply = applyConsent;
    window.applyConsent = function (id, action) {
      const receipt = localApply(id, action);

      // Save updated purpose state to Firestore
      setDoc(doc(fs, `tenants/${tid}/purposes/${id}`), {
        status: action === 'grant' ? 'granted' : 'revoked',
        receipt: receipt,
        updated: Date.now()
      }, { merge: true }).catch(err => console.error('Firestore purpose update error:', err));

      // Save hash-chained ledger block to Firestore
      if (S.ledger && S.ledger.length) {
        const ent = S.ledger[S.ledger.length - 1];
        const docId = String(ent.seq).padStart(6, '0');
        setDoc(doc(fs, `tenants/${tid}/ledger/${docId}`), ent)
          .catch(err => console.error('Firestore ledger write error:', err));
      }

      return receipt;
    };

    // 2. Intercept Rights requests and write directly to Firestore
    const origReqPush = S.requests.push.bind(S.requests);
    S.requests.push = (...rs) => {
      rs.forEach(r => {
        setDoc(doc(fs, `tenants/${tid}/requests/${r.id}`), r)
          .catch(err => console.error('Firestore request write error:', err));
      });
      return origReqPush(...rs);
    };

    // 3. Intercept Purposes and write directly to Firestore
    const origPurpPush = S.purposes.push.bind(S.purposes);
    S.purposes.push = (...ps) => {
      ps.forEach(p => {
        setDoc(doc(fs, `tenants/${tid}/purposes/${p.id}`), p)
          .catch(err => console.error('Firestore purpose create error:', err));
      });
      return origPurpPush(...ps);
    };

    // 4. Intercept API Keys and write directly to Firestore
    const origKeyPush = S.keys.push.bind(S.keys);
    S.keys.push = (...ks) => {
      ks.forEach(k => {
        setDoc(doc(fs, `tenants/${tid}/apiKeys/${k.id}`), k)
          .catch(err => console.error('Firestore key write error:', err));
      });
      return origKeyPush(...ks);
    };

    // 5. Hydrate on initial load directly from Cloud Firestore
    (async () => {
      try {
        const [lSnap, pSnap, rSnap] = await Promise.all([
          getDocs(query(collection(fs, `tenants/${tid}/ledger`), orderBy('seq'))),
          getDocs(collection(fs, `tenants/${tid}/purposes`)),
          getDocs(collection(fs, `tenants/${tid}/requests`))
        ]);

        if (lSnap.size) {
          S.ledger.length = 0;
          lSnap.forEach(d => S.ledger.push(d.data()));
        }
        if (pSnap.size) {
          pSnap.forEach(d => {
            const data = d.data();
            const idx = S.purposes.findIndex(x => x.id === data.id);
            if (idx >= 0) S.purposes[idx] = { ...S.purposes[idx], ...data };
            else S.purposes.push(data);
          });
        }
        if (rSnap.size) {
          rSnap.forEach(d => {
            const data = d.data();
            const idx = S.requests.findIndex(x => x.id === data.id);
            if (idx >= 0) S.requests[idx] = { ...S.requests[idx], ...data };
            else S.requests.push(data);
          });
        }
        if (renderAppCallback) renderAppCallback();
        console.info('ConsentPro: Live Cloud Firestore connected and hydrated successfully.');
      } catch (err) {
        console.warn('ConsentPro: Cloud Firestore initial hydration note:', err.message);
      }
    })();

  } catch (err) {
    console.warn('ConsentPro: Firebase adapter load skipped or offline:', err.message);
  }
}
