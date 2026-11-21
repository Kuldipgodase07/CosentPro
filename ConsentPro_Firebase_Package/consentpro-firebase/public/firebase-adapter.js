// Real-Time Firebase Firestore & Auth Adapter for ConsentPro
// Provides bi-directional synchronization between the ConsentPro client and Cloud Firestore.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, setDoc, collection, getDocs, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const cfg = window.CP_FIREBASE_CONFIG;
if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('YOUR_')) {
  console.info('ConsentPro: Firebase config not set or running in standalone demo mode.');
} else {
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  const fs = getFirestore(app);
  const tid = cfg.tenant || 'orbit';

  if (typeof CP_CONFIG !== 'undefined') {
    CP_CONFIG.firebase = true;
    CP_CONFIG.project = cfg.projectId;
    CP_CONFIG.region = cfg.region;
  }
  if (typeof DB !== 'undefined') {
    DB.tid = tid;
  }

  // 1. Intercept Consent changes and write directly to Firestore (Purposes & Hash-Chained Ledger)
  const localApply = window.applyConsent;
  window.applyConsent = function (id, action) {
    const receipt = localApply(id, action);
    
    // Save updated purpose state to Firestore
    setDoc(doc(fs, `tenants/${tid}/purposes/${id}`), {
      status: action === 'grant' ? 'granted' : 'revoked',
      receipt: receipt,
      updated: Date.now()
    }, { merge: true }).catch(err => console.error('Firestore purpose update error:', err));

    // Save hash-chained ledger block to Firestore
    if (typeof S !== 'undefined' && S.ledger && S.ledger.length) {
      const ent = S.ledger[S.ledger.length - 1];
      const docId = String(ent.seq).padStart(6, '0');
      setDoc(doc(fs, `tenants/${tid}/ledger/${docId}`), ent)
        .catch(err => console.error('Firestore ledger write error:', err));
    }

    return receipt;
  };

  // 2. Intercept Rights requests and write directly to Firestore
  if (typeof S !== 'undefined' && S.requests) {
    const origReqPush = S.requests.push.bind(S.requests);
    S.requests.push = (...rs) => {
      rs.forEach(r => {
        setDoc(doc(fs, `tenants/${tid}/requests/${r.id}`), r)
          .catch(err => console.error('Firestore request write error:', err));
      });
      return origReqPush(...rs);
    };
  }

  // 3. Intercept Purposes and write directly to Firestore
  if (typeof S !== 'undefined' && S.purposes) {
    const origPurpPush = S.purposes.push.bind(S.purposes);
    S.purposes.push = (...ps) => {
      ps.forEach(p => {
        setDoc(doc(fs, `tenants/${tid}/purposes/${p.id}`), p)
          .catch(err => console.error('Firestore purpose create error:', err));
      });
      return origPurpPush(...ps);
    };
  }

  // 4. Intercept API Keys and write directly to Firestore
  if (typeof S !== 'undefined' && S.keys) {
    const origKeyPush = S.keys.push.bind(S.keys);
    S.keys.push = (...ks) => {
      ks.forEach(k => {
        setDoc(doc(fs, `tenants/${tid}/apiKeys/${k.id}`), k)
          .catch(err => console.error('Firestore key write error:', err));
      });
      return origKeyPush(...ks);
    };
  }

  // 5. Hydrate on initial load directly from Cloud Firestore
  (async () => {
    try {
      const [lSnap, pSnap, rSnap] = await Promise.all([
        getDocs(query(collection(fs, `tenants/${tid}/ledger`), orderBy('seq'))),
        getDocs(collection(fs, `tenants/${tid}/purposes`)),
        getDocs(collection(fs, `tenants/${tid}/requests`))
      ]);

      if (typeof S !== 'undefined') {
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
        if (typeof render === 'function') {
          render();
        }
      }
      console.info('ConsentPro: Cloud Firestore sync online & hydrated.');
    } catch (err) {
      console.warn('ConsentPro: Cloud Firestore initial hydration note:', err.message);
    }
  })();
}
