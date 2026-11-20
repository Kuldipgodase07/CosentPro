// Run: firebase emulators:exec --only firestore "node --test tests/"
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { test, before, after } = require('node:test');
const fs = require('fs');
let env;
const ctx = (uid, role, tenant) => env.authenticatedContext(uid, { role, tenant }).firestore();
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'consentpro-test', firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') } });
  await env.withSecurityRulesDisabled(async (c) => {
    await c.firestore().doc('tenants/orbit/ledger/000001').set({ seq: 1 });
    await c.firestore().doc('tenants/orbit/requests/RQ-1').set({ by: 'p1', status: 'Open' });
    await c.firestore().doc('tenants/orbit/apiKeys/k1').set({ name: 'k' });
  });
});
after(() => env.cleanup());
test('auditor can read the ledger', () => assertSucceeds(ctx('a', 'auditor', 'orbit').doc('tenants/orbit/ledger/000001').get()));
test('nobody can write the ledger from a client', () => assertFails(ctx('x', 'admin', 'orbit').doc('tenants/orbit/ledger/000002').set({ seq: 2 })));
test('person cannot read the ledger', () => assertFails(ctx('p1', 'principal', null).doc('tenants/orbit/ledger/000001').get()));
test('person can create own request', () => assertSucceeds(ctx('p1', 'principal', null).doc('tenants/orbit/requests/RQ-2').set({ by: 'p1', status: 'Open' })));
test('person cannot create a request for someone else', () => assertFails(ctx('p1', 'principal', null).doc('tenants/orbit/requests/RQ-3').set({ by: 'p2', status: 'Open' })));
test('person cannot read another persons request', () => assertFails(ctx('p2', 'principal', null).doc('tenants/orbit/requests/RQ-1').get()));
test('dpo can update a request', () => assertSucceeds(ctx('d', 'dpo', 'orbit').doc('tenants/orbit/requests/RQ-1').update({ status: 'Resolved' })));
test('auditor cannot read API keys', () => assertFails(ctx('a', 'auditor', 'orbit').doc('tenants/orbit/apiKeys/k1').get()));
test('other tenant cannot read the ledger', () => assertFails(ctx('z', 'auditor', 'other').doc('tenants/orbit/ledger/000001').get()));
test('person cannot write own consent directly', () => assertFails(ctx('p1', 'principal', null).doc('principals/p1/consents/credit').set({ status: 'granted' })));
