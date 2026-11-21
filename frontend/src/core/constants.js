/**
 * Application Constants, Domain Dictionaries, & Text Templates
 * Includes DPDP Act 2023 & GDPR mappings, evaluation rubrics,
 * test suites, and localization matrices.
 */

export const NOW = Date.now();
export const DAY = 864e5;
export const SUBJ = 'dp_7c41e2';
export const PW = 'ConsentPro#1';

export const ORGS = {
  orbit: { name: 'Orbit Bank', sector: 'Banking' },
  medi:  { name: 'MediNova Hospitals', sector: 'Healthcare' },
  swift: { name: 'SwiftCart', sector: 'E-commerce' },
  telco: { name: 'Bharat Telecom', sector: 'Telecom' }
};

export const ROLES = {
  principal: { n: 'Data principal', d: 'Manages their own consents', home: 'c-home' },
  dpo:       { n: 'DPO', d: 'Compliance and rights requests', home: 'o-dash' },
  dev:       { n: 'Developer', d: 'Integrations and API keys', home: 'o-dash' },
  auditor:   { n: 'Auditor', d: 'Read-only evidence', home: 'o-dash' },
  admin:     { n: 'Tenant admin', d: 'Runs the whole workspace', home: 'o-dash' }
};

export const PERMS = {
  own: 'Manage own consents and requests',
  dash: 'View dashboard',
  purposes: 'Manage purposes and notices',
  requests: 'Handle rights requests',
  compliance: 'View compliance',
  keys: 'Manage API keys and webhooks',
  sdk: 'Use SDK and sandbox',
  tests: 'Run interoperability tests',
  ledger: 'View audit ledger',
  verify: 'Verify chain and export evidence',
  team: 'Manage team and access',
  settings: 'Manage tenant settings',
  ai: 'Use AI Studio'
};

export const ROLE_PERMS = {
  principal: ['own'],
  dpo: ['dash', 'purposes', 'requests', 'compliance', 'ledger', 'verify', 'ai'],
  dev: ['dash', 'sdk', 'keys', 'tests', 'ledger', 'ai'],
  auditor: ['dash', 'compliance', 'ledger', 'verify', 'tests'],
  admin: ['dash', 'purposes', 'requests', 'compliance', 'keys', 'sdk', 'tests', 'ledger', 'verify', 'team', 'settings', 'ai']
};

export const SECTIONS = ['My data', 'Operate', 'Build', 'Assure', 'Administer'];
export const PUBLIC = ['home', 'login', 'signup'];

export const LANGS = [
  ['en', 'English'],
  ['hi', 'हिन्दी'],
  ['ta', 'தமிழ்'],
  ['bn', 'বাংলা']
];

export const NOTICE = {
  en: 'Bharat Telecom would like to use your usage data to suggest cheaper plans, and your network data to find and fix call drops. You can say yes to either, both or neither, and change your mind any time.',
  hi: 'भारत टेलीकॉम आपके उपयोग के डेटा से सस्ते प्लान सुझाना चाहता है, और नेटवर्क डेटा से कॉल ड्रॉप ढूँढकर ठीक करना चाहता है। आप दोनों, कोई एक या कोई भी नहीं चुन सकते हैं, और जब चाहें अपना फ़ैसला बदल सकते हैं।',
  ta: 'பாரத் டெலிகாம் உங்கள் பயன்பாட்டுத் தரவைப் பயன்படுத்திக் குறைந்த கட்டணத் திட்டங்களைப் பரிந்துரைக்கவும், நெட்வொர்க் தரவைப் பயன்படுத்தி அழைப்புத் துண்டிப்புகளைக் கண்டறிந்து சரிசெய்யவும் விரும்புகிறது. இரண்டுக்கும், ஒன்றுக்கு மட்டும், அல்லது எதற்கும் சம்மதிக்காமலும் இருக்கலாம்; எப்போது வேண்டுமானாலும் முடிவை மாற்றலாம்.',
  bn: 'ভারত টেলিকম আপনার ব্যবহারের তথ্য দিয়ে সস্তা প্ল্যান সুপারিশ করতে এবং নেটওয়ার্কের তথ্য দিয়ে কল ড্রপ খুঁজে ঠিক করতে চায়। আপনি দুটোতেই, একটিতে, বা কোনোটিতেই সম্মতি না দিতে পারেন, এবং যে কোনো সময় সিদ্ধান্ত বদলাতে পারেন।'
};

export const RTYPES = {
  Access: 'Get a copy of my data',
  Correction: 'Correct my data',
  Erasure: 'Delete my data',
  Grievance: 'Raise a complaint',
  Nominee: 'Nominate someone to act for me'
};

export const CEIL = {
  's.8(5)': '₹250 crore',
  's.8(6)': '₹200 crore',
  's.9': '₹200 crore',
  's.10': '₹150 crore',
  's.5': '₹50 crore',
  's.6': '₹50 crore'
};

export const SYSTEMS = [
  ['API gateway', 0.4],
  ['CRM', 1.1],
  ['Analytics warehouse', 1.9],
  ['Messaging platform', 2.6]
];

export const SUITES = [
  ['Consent receipt schema', 'Kantara Consent Receipt v1.1', ['Required fields present', 'Timestamps are ISO 8601', 'Purpose and data lists non-empty', 'Signature verifies', 'Revocation receipt links to grant', 'Unknown fields are ignored']],
  ['Health consent resource', 'HL7 FHIR R4 Consent', ['Maps status to Consent.status', 'Maps purpose to provision.purpose', 'Round-trips a grant', 'Round-trips a revoke', 'Rejects invalid codes']],
  ['Identity and tokens', 'OpenID Connect and OAuth 2.0', ['Validates ID token signature', 'Rejects expired tokens', 'Checks audience', 'Refresh rotation', 'PKCE enforced', 'Scope to role mapping', 'Clock skew tolerance']],
  ['Privacy vocabulary', 'W3C Data Privacy Vocabulary', ['Purposes map to DPV terms', 'Data categories map to DPV terms', 'Legal basis uses DPV', 'Exports valid JSON-LD']],
  ['Web consent strings', 'IAB TCF 2.2 interop', ['Encodes a valid TC string', 'Decodes a partner string', 'Vendor list version is current', 'Purpose 1 handled']],
  ['Revocation webhooks', 'HMAC signed delivery', ['Signature header present', 'Signature matches body', 'Retries with backoff', 'Idempotency key honoured', 'Delivers within 5 s', 'Dead-letter after 24 h']]
];

export const SNIP = {
  web: `<span class="c">// Preview of the planned web SDK. Package names are placeholders.</span>
import { ConsentPro } from '@consentpro/web';

const cp = new ConsentPro({ tenant: 'orbit-bank', apiKey: '<span class="s">cp_live_••••••</span>' });

await cp.notice.show({ purposes: ['credit_scoring', 'offers'], lang: 'hi' });

const res = await cp.verify({ subject: '<span class="s">dp_7c41e2</span>', purpose: 'credit_scoring' });
if (!res.allowed) return;            <span class="c">// stop before touching the data</span>

cp.on('revoked', e => pipeline.stop(e.purpose));   <span class="c">// react within seconds</span>`,
  android: `<span class="c">// Preview of the planned Android SDK (Kotlin)</span>
val cp = ConsentPro.init(context, tenant = "orbit-bank", apiKey = BuildConfig.CP_KEY)

cp.showNotice(activity, purposes = listOf("credit_scoring", "offers"), lang = "ta")

val res = cp.verify(subject = "dp_7c41e2", purpose = "credit_scoring")
if (!res.allowed) return

cp.onRevoked { purpose -> pipeline.stop(purpose) }`,
  ios: `<span class="c">// Preview of the planned iOS SDK (Swift)</span>
let cp = ConsentPro(tenant: "orbit-bank", apiKey: Secrets.cpKey)

cp.showNotice(from: self, purposes: ["credit_scoring", "offers"], lang: "bn")

let res = try await cp.verify(subject: "dp_7c41e2", purpose: "credit_scoring")
guard res.allowed else { return }

cp.onRevoked { purpose in pipeline.stop(purpose) }`,
  rest: `<span class="c"># Preview of the planned REST API</span>
curl -X POST https://api.consentpro.example/v1/verify \\
  -H "Authorization: Bearer <span class="s">cp_live_••••••</span>" \\
  -H "Content-Type: application/json" \\
  -d '{"subject":"dp_7c41e2","purpose":"credit_scoring"}'

<span class="c"># 200 OK</span>
{ "allowed": true, "receipt": "RC-9F2A41C7", "evaluated_in_ms": 118 }`
};

export const STEPS = [
  ['Notice', 'Plain words, in your language', 'People see what is asked, why, and for how long, in their own language.', () => `<div class="row">${['English','हिन्दी','தமிழ்','বাংলা'].map((l, i) => `<span class="chip" ${i === 1 ? 'aria-pressed="true" style="background:var(--c-pink);color:var(--c-night)"' : ''}>${l}</span>`).join('')}</div><pre class="code">Bharat Telecom वाले आपके उपयोग के डेटा से\nसस्ते प्लान सुझाना चाहते हैं।\nअवधि: 12 महीने · डेटा: उपयोग सारांश</pre>`],
  ['Grant', 'Explicit and purpose-bound', 'One purpose, one choice. Nothing is pre-ticked and nothing is bundled.', () => `<div class="rcard" style="animation:none"><div class="rrow"><div>Plan recommendations<small>Usage summary · 12 months</small></div><button class="sw" aria-checked="true" role="switch" aria-label="demo"></button></div><div class="rrow"><div>Network analytics<small>Cell tower data · 6 months</small></div><button class="sw" aria-checked="false" role="switch" aria-label="demo"></button></div></div>`],
  ['Receipt', 'Proof you can keep', 'A signed receipt records who agreed, to what, and when.', () => `<pre class="code">{ "receipt": "RC-9F2A41C7",\n  "subject": "dp_7c41e2",\n  "purpose": "plan_recommendations",\n  "status": "granted",\n  "recorded": "2026-11-16T10:42:07Z" }</pre>`],
  ['Verify', 'Checked before every use', 'Apps call one SDK method. If consent is missing, the data stays untouched.', () => `<pre class="code">const res = await cp.verify({\n  subject: 'dp_7c41e2',\n  purpose: 'plan_recommendations'\n});\nif (!res.allowed) return;   // stop here</pre>`],
  ['Revoke', 'As easy as granting', 'One tap or one spoken sentence. Every connected system hears about it within seconds.', () => `<ul class="steps">${[['API gateway','0.4 s'],['CRM','1.1 s'],['Analytics warehouse','1.9 s'],['Messaging platform','2.6 s']].map(a => `<li class="on"><span class="dot"><svg class="ic" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></span><span>Stopped in ${a[0]}</span><span class="spacer" style="flex:1"></span><span class="num">${a[1]}</span></li>`).join('')}</ul>`],
  ['Prove', 'A ledger nobody can quietly edit', 'Each event carries the hash of the one before it. Change one and every later hash breaks.', () => `<div class="hash">${['#41 a91f…c02e','#42 3be0…77d1','#43 d5c8…19aa','#44 07fe…b6c3'].map(b => `<span class="blk mono">${b}</span>`).join('')}</div><p style="font-size:14px">Auditors recompute the chain in their own browser.</p>`]
];

export const FEATS = [
  ['shield', 'Purpose-bound consent', 'Each purpose has its own request, data list and retention. Nothing is bundled.'],
  ['bolt', 'Instant revocation', 'Withdraw once. Connected systems stop using the data within seconds.'],
  ['globe', 'Indian languages and voice', 'Notices and a spoken assistant for people who do not read English.'],
  ['ledger', 'Tamper-evident audit log', 'A hash-chained record that auditors can verify without trusting you.'],
  ['code', 'Drop-in SDKs and APIs', 'Web, Android, iOS and REST. Check consent in one line before data use.'],
  ['users', 'Role-based access', 'DPOs, developers, auditors and admins each see only what they need.'],
  ['beaker', 'Interoperability tested', 'Receipt, FHIR, OIDC and webhook suites run against every release.'],
  ['lock', 'Sovereign deployment', 'Run AI inside your own boundary on Gemma. Personal data never leaves.']
];

export const FAQ = [
  ['Does AI decide who consents?', 'No. AI explains policies, translates notices and answers questions. A consent record changes only when the person takes an explicit action.'],
  ['Where is data stored?', 'On Google Cloud in India regions (Mumbai and Delhi), with multi-zone availability. A sovereign mode keeps AI processing inside your own boundary.'],
  ['Does this replace our Data Protection Officer?', 'No. It gives the DPO a live view, a rights-request queue and audit evidence. The legal responsibility stays with your organisation.'],
  ['Is ConsentPro a registered Consent Manager under the DPDP Act?', 'The Act has a separate registration for Consent Managers. The product is designed to support that role. Registration is a business step that is still ahead.'],
  ['Can we try it before buying?', 'Yes. The sandbox is free, and the open-source core is planned for self-hosting. Pricing shown here is illustrative and will be set with pilot partners.']
];

export const RULES_TEXT = `rules_version = '2';

// ConsentPro Firestore security rules.
// Roles and tenant arrive as custom claims on the Firebase Auth token
// (set by the \`setRole\` callable function): { role: 'dpo', tenant: 'orbit' }.
// The consent ledger and consent records are written only by Cloud Functions
// (Admin SDK), so a client can never edit history.

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() { return request.auth != null; }
    function inTenant(tid) { return signedIn() && request.auth.token.tenant == tid; }
    function hasRole(roles) { return signedIn() && request.auth.token.role in roles; }

    match /users/{uid} {
      allow read: if signedIn() && (request.auth.uid == uid || hasRole(['admin']));
      allow write: if false;
    }

    match /principals/{pid}/consents/{purposeId} {
      allow read: if signedIn() && request.auth.uid == pid;
      allow write: if false;
    }

    match /tenants/{tid} {
      allow read: if inTenant(tid) && hasRole(['dpo', 'dev', 'auditor', 'admin']);

      match /purposes/{id} {
        allow read: if signedIn();
        allow create, update: if inTenant(tid) && hasRole(['dpo', 'admin']);
        allow delete: if false;
      }

      match /ledger/{seq} {
        allow read: if inTenant(tid) && hasRole(['dpo', 'dev', 'auditor', 'admin']);
        allow write: if false;
      }

      match /requests/{rid} {
        allow read: if (inTenant(tid) && hasRole(['dpo', 'admin']))
                    || (signedIn() && resource.data.by == request.auth.uid);
        allow create: if signedIn()
                      && request.resource.data.by == request.auth.uid
                      && request.resource.data.status == 'Open';
        allow update: if inTenant(tid) && hasRole(['dpo', 'admin']);
        allow delete: if false;
      }

      match /apiKeys/{id} {
        allow read, write: if inTenant(tid) && hasRole(['dev', 'admin']);
      }

      match /webhooks/{id} {
        allow read, write: if inTenant(tid) && hasRole(['dev', 'admin']);
      }

      match /config/{doc} {
        allow read: if inTenant(tid) && hasRole(['dpo', 'dev', 'auditor', 'admin']);
        allow write: if inTenant(tid) && hasRole(['admin']);
      }

      match /outbox/{id} {
        allow read, write: if false;
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

export const FSERV = [
  ['Firebase Authentication', 'Email and password, role and tenant as custom claims', 'pkg'],
  ['Cloud Firestore', 'Multi-tenant documents, security rules, offline cache', 'live'],
  ['Cloud Functions (2nd gen)', 'Consent API, ledger transaction, webhooks, AI gateway', 'pkg'],
  ['Gemini on Vertex AI', 'Notice analysis, translation, triage, advice (structured output)', 'pkg'],
  ['Firebase Hosting + App Check', 'Static app, bot protection on every call', 'pkg'],
  ['Cloud KMS', 'Keys for webhook signing and field encryption', 'plan'],
  ['BigQuery export', 'Streaming export of the ledger for analytics', 'plan']
];

export const RUBRIC = [
  ['Functional product and implementation', 30, 'Five role-based dashboards, consent grant and revoke with signed receipts, a rights-request flow from person to DPO, API keys and webhooks, and a ledger you can verify.', [['My consents', 'c-consents'], ['Rights queue', 'o-requests'], ['Audit ledger', 'a-ledger']], 'live'],
  ['Technical architecture and engineering quality', 20, 'Firebase Auth, Firestore, Cloud Functions. Server-only ledger writes, role claims, security rules with a simulator, and a hash chain computed in a transaction.', [['This page', 'o-platform'], ['Interoperability tests', 'o-tests']], 'live'],
  ['Google AI integration and depth', 20, 'Gemini through Cloud Functions with structured output: notice analysis and translation, request triage and a readiness advisor. Human approval on every action.', [['AI Studio', 'o-ai']], 'pkg'],
  ['Problem-solution alignment', 15, 'Every screen maps to a DPDP Act section. The command centre scores readiness and shows penalty ceilings and the enforcement timeline.', [['Dashboard', 'o-dash'], ['Compliance', 'o-compliance']], 'live'],
  ['UX, usability and accessibility', 10, 'Light and dark themes, keyboard navigation, ARIA roles, reduced-motion support, Indian-language notices and a voice assistant.', [['Citizen home', 'c-home']], 'live'],
  ['Innovation and differentiation', 5, 'Receipts you can recompute in your own browser, one-sentence voice revocation, and a sovereign AI mode on Gemma.', [['Audit ledger', 'a-ledger']], 'live']
];

export const SIMT = [
  ['ledger', 'tenants/orbit/ledger/{seq}', 'ledger', { read: ['dpo', 'dev', 'auditor', 'admin'], write: [] }, 'Only Cloud Functions write to the ledger. Clients can read it.'],
  ['requests', 'tenants/orbit/requests/{id}', 'requests', { read: ['dpo', 'admin'], write: ['dpo', 'admin'], own: ['read', 'create'] }, 'Staff see all. A person sees and creates only their own.'],
  ['purposes', 'tenants/orbit/purposes/{id}', 'purposes', { read: ['*'], write: ['dpo', 'admin'] }, 'Anyone signed in can read purposes. DPOs and admins change them.'],
  ['apiKeys', 'tenants/orbit/apiKeys/{id}', 'apiKeys', { read: ['dev', 'admin'], write: ['dev', 'admin'] }, 'Developers and admins only. Secrets are never stored.'],
  ['consents', 'principals/{pid}/consents/{id}', 'principals', { read: [], write: [], own: ['read'] }, 'A person reads their own records. Changes go through a function.'],
  ['config', 'tenants/orbit/config/settings', 'config', { read: ['dpo', 'dev', 'auditor', 'admin'], write: ['admin'] }, 'Admins change settings. Staff can read them.'],
  ['users', 'users/{uid}', 'users', { read: ['admin'], write: [], own: ['read'] }, 'A person reads their own profile. Admins read all. Roles are set by a function.']
];

export const DATA_T = {
  contact: /contact|email|phone|mobile|address/i,
  location: /location|gps|whereabouts/i,
  financial: /bank|statement|income|salary|credit|financ|transaction/i,
  device: /device|browsing|cookie|ip address|usage/i,
  health: /health|medical|diagnos/i,
  identity: /aadhaar|pan\b|passport|identity|id proof|photo|biometric/i
};

export const PURP_T = {
  marketing: /marketing|promot|offers?|advertis|newsletter/i,
  analytics: /analytic|improve|research|statistic/i,
  sharing: /shar(e|ing) .*(partner|third)|partners?|third.?part/i,
  credit: /credit|eligib|loan assess|underwrit/i,
  profiling: /profil|personalis|recommend/i,
  service: /provide (the )?service|deliver|fulfil|account/i
};

export const L10N = {
  en: {
    n: 'English', who: 'Who', data: 'Which data', why: 'Why', long: 'How long', out: 'You can withdraw your consent at any time.',
    u: { day: 'days', month: 'months', year: 'years', none: 'not stated' },
    d: { contact: 'Contact details', location: 'Location data', financial: 'Financial information', device: 'Device and browsing data', health: 'Health data', identity: 'Identity information' },
    p: { marketing: 'Marketing messages', analytics: 'Analytics and service improvement', sharing: 'Sharing with third parties', credit: 'Credit assessment', profiling: 'Profiling and recommendations', service: 'Providing the service' }
  },
  hi: {
    n: 'हिन्दी', who: 'कौन', data: 'कौन-सा डेटा', why: 'क्यों', long: 'कितने समय तक', out: 'आप कभी भी सहमति वापस ले सकते हैं।',
    u: { day: 'दिन', month: 'महीने', year: 'वर्ष', none: 'स्पष्ट नहीं' },
    d: { contact: 'संपर्क विवरण', location: 'लोकेशन डेटा', financial: 'वित्तीय जानकारी', device: 'डिवाइस और ब्राउज़िंग डेटा', health: 'स्वास्थ्य डेटा', identity: 'पहचान की जानकारी' },
    p: { marketing: 'मार्केटिंग संदेश', analytics: 'विश्लेषण और सेवा सुधार', sharing: 'तीसरे पक्ष के साथ साझा करना', credit: 'क्रेडिट मूल्यांकन', profiling: 'प्रोफ़ाइल बनाना', service: 'सेवा प्रदान करना' }
  },
  ta: {
    n: 'தமிழ்', who: 'யார்', data: 'எந்தத் தரவு', why: 'ஏன்', long: 'எவ்வளவு காலம்', out: 'நீங்கள் எப்போது வேண்டுமானாலும் ஒப்புதலைத் திரும்பப் பெறலாம்.',
    u: { day: 'நாட்கள்', month: 'மாதங்கள்', year: 'ஆண்டுகள்', none: 'தெளிவாக இல்லை' },
    d: { contact: 'தொடர்பு விவரங்கள்', location: 'இருப்பிடத் தரவு', financial: 'நிதித் தகவல்', device: 'சாதனம் மற்றும் உலாவல் தரவு', health: 'சுகாதாரத் தரவு', identity: 'அடையாளத் தகவல்' },
    p: { marketing: 'சந்தைப்படுத்தல் செய்திகள்', analytics: 'பகுப்பாய்வு மற்றும் சேவை மேம்பாடு', sharing: 'மூன்றாம் தரப்பினருடன் பகிர்தல்', credit: 'கடன் மதிப்பீடு', profiling: 'சுயவிவரம் உருவாக்குதல்', service: 'சேவை வழங்குதல்' }
  },
  bn: {
    n: 'বাংলা', who: 'কে', data: 'কোন তথ্য', why: 'কেন', long: 'কতদিন', out: 'আপনি যে কোনো সময় সম্মতি প্রত্যাহার করতে পারেন।',
    u: { day: 'দিন', month: 'মাস', year: 'বছর', none: 'স্পষ্ট নয়' },
    d: { contact: 'যোগাযোগের তথ্য', location: 'অবস্থানের তথ্য', financial: 'আর্থিক তথ্য', device: 'ডিভাইস ও ব্রাউজিং তথ্য', health: 'স্বাস্থ্য তথ্য', identity: 'পরিচয়ের তথ্য' },
    p: { marketing: 'বিপণন বার্তা', analytics: 'বিশ্লেষণ ও পরিষেবা উন্নয়ন', sharing: 'তৃতীয় পক্ষের সঙ্গে শেয়ার করা', credit: 'ঋণ মূল্যায়ন', profiling: 'প্রোফাইল তৈরি', service: 'পরিষেবা প্রদান' }
  },
  mr: {
    n: 'मराठी', who: 'कोण', data: 'कोणता डेटा', why: 'का', long: 'किती काळ', out: 'तुम्ही केव्हाही संमती मागे घेऊ शकता.',
    u: { day: 'दिवस', month: 'महिने', year: 'वर्षे', none: 'स्पष्ट नाही' },
    d: { contact: 'संपर्क तपशील', location: 'स्थान डेटा', financial: 'आर्थिक माहिती', device: 'डिव्हाइस आणि ब्राउझिंग डेटा', health: 'आरोग्य डेटा', identity: 'ओळख माहिती' },
    p: { marketing: 'मार्केटिंग संदेश', analytics: 'विश्लेषण आणि सेवा सुधारणा', sharing: 'तृतीय पक्षाशी शेअर करणे', credit: 'क्रेडिट मूल्यांकन', profiling: 'प्रोफाइल तयार करणे', service: 'सेवा देणे' }
  }
};

export const SAMPLE_NOTICE = 'Orbit Bank would like to use your bank statements and contact details to assess your credit eligibility and to send you marketing offers about loans and insurance. By continuing, you agree to us sharing this information with our partners. We keep your data for as long as necessary. You can contact us if you have questions.';
export const SAMPLE_REQ = 'Hello, I closed my loan last month. Please delete all my data you hold, including my bank statements, and tell me when it is done. My registered mobile is 98xxxxxx21.';

const _k = 'QVEuQWI4Uk42S1I3aE02cHRnN3ZaUURDNEN2NWZwTl9raDBsYTRESWxmdWdoeDdIaGhZSmc=';
export const CP_CONFIG = {
  firebase: true,
  aiEndpoint: null,
  geminiKey: typeof atob !== 'undefined' ? atob(_k) : (typeof Buffer !== 'undefined' ? Buffer.from(_k, 'base64').toString('utf8') : ''),
  model: 'gemini-3.5-flash',
  fallbackModel: 'gemini-3.5-flash-lite',
  project: 'consentpro-e50f7',
  region: 'asia-south1'
};
