# ConsentPro on Firebase

Backend: Firebase Authentication, Cloud Firestore, Cloud Functions (2nd gen), Firebase Hosting.
AI: Gemini on Vertex AI, called only from Cloud Functions.

## What is in this folder

| Path | What it does |
|---|---|
| `public/index.html` | The ConsentPro web app (same file as the prototype) |
| `public/firebase-config.js` | Your Firebase web config. Fill this in |
| `public/firebase-adapter.js` | Switches the app from demo mode to Firebase when the config is set |
| `firestore.rules` | Role and tenant based security rules. Clients can never write the ledger |
| `functions/index.js` | `recordConsent`, `verifyChain`, `setRole`, `verifyConsent` (SDK endpoint), `deliverWebhook`, `aiLint`, `aiTriage`, `aiAdvise` |
| `functions/lib/ledger.js` | SHA-256 hash chain written in one Firestore transaction |
| `functions/lib/ai.js` | Gemini prompts with response schemas and identifier redaction |
| `scripts/seed.js` | Creates the five demo users with role claims, one tenant and three purposes |
| `tests/rules.test.js` | Ten security-rule tests for the emulator |

## Deploy

1. Create a Firebase project on the Blaze plan. Pick **asia-south1 (Mumbai)** for Firestore.
2. Enable Authentication (Email/Password), Firestore, Functions, Hosting, and the **Vertex AI API** in Google Cloud.
3. `npm i -g firebase-tools && firebase login`
4. Put your project id in `.firebaserc`. Add a web app in Firebase and copy its config into `public/firebase-config.js`.
5. `cd functions && npm install && cd ..`
6. `firebase deploy`
7. Seed demo data: `cd functions && npm i && cd .. && DEMO_PASSWORD='choose-a-strong-one' GCLOUD_PROJECT=your-project node scripts/seed.js`
8. Optional: set a webhook signing secret with `firebase functions:secrets:set WEBHOOK_SECRET`.

Run locally first: `firebase emulators:start`, then in another shell `cd tests && npm i && cd .. && firebase emulators:exec --only firestore "node --test tests/"`.

## Data model

```
users/{uid}                              profile, role
principals/{uid}/consents/{purposeId}    a person's consent state (server-written)
tenants/{tid}/purposes/{id}
tenants/{tid}/ledger/{000001..}          hash-chained events (server-written)
tenants/{tid}/meta/ledger                { seq, head } used by the transaction
tenants/{tid}/requests/{id}              rights requests
tenants/{tid}/apiKeys/{id}               { name, prefix, hash, scopes, status }  (never the key itself)
tenants/{tid}/webhooks/{id}
tenants/{tid}/outbox/{id}                pending webhook deliveries (server-only)
tenants/{tid}/config/settings
```

## Honest status

- The prototype page you demoed runs without a server. Its Platform page shows the Firestore-shaped writes the app makes. Nothing in the demo talks to Google.
- This package was syntax-checked and its logic reviewed, but **it has not been deployed or run against a live Firebase project or the emulator**. Run the rule tests and deploy to a test project before showing it as live.
- The adapter wires Gemini calls, consent changes, rights requests and ledger loading. **Sign-in is still the demo login.** Next step: call `signInWithEmailAndPassword` in `doLogin`, read the `role` and `tenant` claims from `getIdTokenResult()`, and build `S.user` from them. `scripts/seed.js` creates users ready for this.
- API keys: the function looks up `hash` (SHA-256 of the key). Update the app's key-creation code to store that hash on the server, via a function, instead of only a prefix.
- Check the current Gemini model name in your region and set `GEMINI_MODEL` if needed. The default is `gemini-2.5-flash`.
- Translations in the demo are fixed templates for four languages. With Gemini connected, extend `functions/lib/ai.js` to return translations and have the app show them.
- DPDP compliance is a legal question. ConsentPro supports your duties; it does not replace legal advice or the DPO.
