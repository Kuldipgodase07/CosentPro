// Creates the five demo users with role claims, plus one tenant and purposes.
// Usage: GCLOUD_PROJECT=your-project node scripts/seed.js   (use the emulator env vars to seed locally)
const admin = require('../functions/node_modules/firebase-admin');
admin.initializeApp();
const db = admin.firestore(), auth = admin.auth();
const PW = process.env.DEMO_PASSWORD;
if (!PW) { console.error('Set DEMO_PASSWORD to a strong password.'); process.exit(1); }
const USERS = [['aarav@example.com', 'Aarav Mehta', 'principal'], ['meera@orbit.example', 'Meera Nair', 'dpo'], ['dev@orbit.example', 'Dev Rao', 'dev'], ['audit@orbit.example', 'Isha Verma', 'auditor'], ['neha@orbit.example', 'Neha Kapoor', 'admin']];
(async () => {
  for (const [email, displayName, role] of USERS) {
    let u; try { u = await auth.getUserByEmail(email); } catch { u = await auth.createUser({ email, displayName, password: PW }); }
    await auth.setCustomUserClaims(u.uid, { role, tenant: role === 'principal' ? null : 'orbit' });
    await db.doc(`users/${u.uid}`).set({ email, name: displayName, role, tenant: role === 'principal' ? null : 'orbit' });
    console.log('user', email, role);
  }
  const P = [['credit', 'Credit scoring'], ['offers', 'Product offers'], ['insure', 'Insurance partners']];
  for (const [id, name] of P) await db.doc(`tenants/orbit/purposes/${id}`).set({ name, org: 'orbit', status: 'pending', updated: Date.now() });
  await db.doc('tenants/orbit').set({ name: 'Orbit Bank', plan: 'Growth', region: 'asia-south1' });
  console.log('seeded');
})();
