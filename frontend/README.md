# ConsentPro Front-End Project

An enterprise-grade, dynamic, real-time Front-End Web Application for Privacy and Consent Management, built in compliance with India's **Digital Personal Data Protection (DPDP) Act, 2023** and **GDPR**.

This dynamic front-end project is a modular, production-level realization of `ConsentPro.html`, preserving **100% pixel-perfect UI/UX, animations, colors, typographic tokens, and interactive components**, while structured into an industry-standard directory layout.

---

## 🌟 Key Capabilities & Live Dynamic Features

- **100% Visual & Behavioral Fidelity**: Every SVG icon, gradient, card, switch, badge, modal, command palette, chart, ring, and toast is identical to the prototype.
- **5 Dynamic Role-Based Views**:
  1. **Citizen / Data Principal (`principal`)**: Purpose catalog, single-tap/spoken revocation, rights management (Access, Correction, Erasure, Grievance, Nominee), multilingual inbox, plain-language assistant.
  2. **Data Protection Officer (`dpo`)**: DPDP statutory obligations checklist, May 2027 enforcement countdown, penalty ceilings (up to ₹250 cr), consent conversion funnel, rights SLA queue.
  3. **Developer (`dev`)**: RPM & latency p95 monitoring, 90-day service uptime, scoped API keys, HMAC webhook testing, interop test suites (Kantara, FHIR R4, OIDC, W3C DPV, IAB TCF 2.2).
  4. **Auditor (`auditor`)**: Cryptographic SHA-256 hash-chain verification, intentional tamper simulation, random sample re-hashing, exportable evidence bundles.
  5. **Tenant Admin (`admin`)**: Interactive Role-Based Access Control (RBAC) matrix, team members & invites, mandatory 2FA security posture, multi-language notice configuration.
- **Gemini AI Studio (v5)**:
  - **Notice Studio**: Analyzes privacy policies against 9 DPDP statutory requirements, assigns a 0–100 compliance score, and generates multilingual plain-language cards in English, Hindi, Tamil, Bengali, and Marathi.
  - **Request Triage**: Classifies citizen requests under sections 11–14, flags urgency, checks lawful retention limits, and drafts human-in-the-loop responses.
  - **Readiness Advisor**: Ranks tenant gaps by statutory penalty exposure and builds prioritized action plans with designated role owners.
- **Platform Architecture & Live Firestore Simulator**:
  - Live interactive interactive Google Cloud / Firebase architecture SVG diagram.
  - In-browser Cloud Firestore console tracking real-time document sets, updates, reads, writes, and callable function calls.
  - Interactive Security Rules simulator evaluating custom token claims (`role`, `tenant`) against `firestore.rules`.
- **Real-Time Live Event Simulation**: Synthetic traffic ticker generating grants, revocations, and verifications with dynamic p95 latency updates.

---

## 📁 Production Directory Structure

```text
frontend/
├── index.html                   # Master HTML entry point
├── package.json                 # Production scripts and dependencies (Vite)
├── vite.config.js               # Vite build and dev server configuration
├── .gitignore                   # Standard git exclusions
├── .env.example                 # Environment variable templates
├── README.md                    # Project documentation
├── public/
│   ├── favicon.svg              # Brand SVG favicon
│   └── firebase-config.js       # Production Firebase configuration hook
└── src/
    ├── index.js                 # Application bootstrap & global event delegation
    ├── core/
    │   ├── constants.js         # Domain constants, DPDP sections, rubrics, text
    │   ├── crypto.js            # Real SHA-256 subtle crypto & canon serializer
    │   ├── router.js            # RBAC router, route registry & access guards
    │   └── state.js             # Central reactive state store & data helpers
    ├── components/
    │   ├── icons.js             # SVG icon definitions & icon helper
    │   ├── layout/
    │   │   ├── sidebar.js       # Dynamic role-aware sidebar & collapse rail
    │   │   └── topbar.js        # Sticky header, breadcrumbs, command trigger
    │   └── ui/
    │       ├── charts.js        # SVG 14-day trends, donuts, sparklines, rings
    │       ├── command-palette.js # Ctrl+K interactive command palette
    │       ├── drawer.js        # Notification side drawer
    │       ├── modal.js         # Confirmations, receipts & key dialogs
    │       ├── toast.js         # Ephemeral toast notifications
    │       └── user-menu.js     # Popover profile & instant demo role switcher
    ├── services/
    │   ├── ai-engine.js         # Gemini AI notice linter, triage & advisor
    │   ├── firebase-adapter.js  # Optional cloud adapter for Vertex AI & Firestore
    │   ├── firestore-db.js      # In-browser multi-tenant document store & logger
    │   ├── ledger.js            # SHA-256 hash-chaining, verify & tamper test
    │   ├── simulation.js        # Real-time traffic ticker & latency sampler
    │   └── theme.js             # Light, Dark & System theme manager
    ├── styles/
    │   ├── main.css             # Master CSS entry importing all modular sheets
    │   ├── tokens.css           # 6-gradient color tokens, variables, typography
    │   ├── shell.css            # Sidebar, topbar, rail, navigation
    │   ├── components.css       # Cards, buttons, pills, switches, tables
    │   └── views/
    │       ├── landing.css      # v4 public landing page & interactive showcase
    │       ├── auth.css         # v4 split-screen auth, OTP & role pickers
    │       └── studio-platform.css # Gemini AI Studio & Firestore console styles
    └── views/
        ├── public/
        │   ├── landing.js       # Interactive landing view & timeline
        │   └── auth.js          # Login, Signup, 6-digit MFA & role buttons
        ├── citizen/
        │   ├── home.js          # Citizen overview, rights & attention list
        │   ├── consents.js      # Granular purpose catalog by organisation
        │   ├── inbox.js         # Multilingual consent request viewer
        │   ├── assistant.js     # Conversational plain-language assistant
        │   ├── requests.js      # Citizen rights requests form & tracking
        │   └── activity.js      # Personal ledger audit history
        ├── dpo/
        │   ├── dashboard.js     # Compliance command centre & penalty ceilings
        │   ├── purposes.js      # Purpose management & new purpose creation
        │   ├── notices.js       # 22-language translation matrix & preview
        │   ├── requests.js      # Citizen rights requests SLA queue
        │   └── compliance.js    # Statutory readiness checklist
        ├── developer/
        │   ├── dashboard.js     # RPM, latency, uptime, key usage
        │   ├── sdk.js           # SDK snippets (Web, Android, iOS, REST) & test runner
        │   ├── keys.js          # API keys & HMAC webhooks
        │   └── tests.js         # 6 conformance test suites
        ├── auditor/
        │   ├── dashboard.js     # Evidence coverage & random sampling
        │   ├── ledger.js        # Verifiable append-only ledger & tamper test
        │   └── reports.js       # Evidence bundle export
        ├── admin/
        │   ├── dashboard.js     # Tenant overview, security checks & plan usage
        │   ├── team.js          # Team members & RBAC permission matrix
        │   └── settings.js      # Workspace configuration & DPO contact
        ├── ai/
        │   └── ai-studio.js     # Notice Studio, Triage & Readiness Advisor
        └── platform/
            └── platform.js      # Cloud Architecture SVG, Console & Rules Sim
```

---

## 🚀 Running the Project

### Option 1: Instant Server (Zero Install)
You can serve the project immediately using Node's built-in HTTP server:
```bash
cd frontend
npm run serve
```
Open **`http://localhost:3000`** in any web browser.

### Option 2: Modern Vite Dev Server (HMR)
```bash
cd frontend
npm install
npm run dev
```

### Option 3: Production Build
```bash
npm run build
npm run preview
```

---

## 👥 Demo Accounts & Credentials

To explore any role immediately, visit the login page (`#login`) and click any role button, or use the credentials below:

| Role | Name | Email | Password | Home View |
|---|---|---|---|---|
| **Data Principal** | Aarav Mehta | `aarav@example.com` | `ConsentPro#1` | `#c-home` |
| **DPO** | Meera Nair | `meera@orbitbank.example` | `ConsentPro#1` | `#o-dash` |
| **Developer** | Kabir Shah | `kabir@orbitbank.example` | `ConsentPro#1` | `#o-dash` |
| **Auditor** | Rhea D’Souza | `rhea@auditfirm.example` | `ConsentPro#1` | `#o-dash` |
| **Tenant Admin** | Neha Kapoor | `neha@orbitbank.example` | `ConsentPro#1` | `#o-dash` |

*Note: For MFA verification prompts on staff accounts, enter the demo code **`482913`**.*

---

## 🛡️ Tamper-Evident Ledger Verification

1. Log in as an **Auditor** (`rhea@auditfirm.example`) or navigate to **Audit Ledger** (`#a-ledger`).
2. Click **Verify chain**: The client recomputes every SHA-256 digest locally using the Web Cryptography API (`crypto.subtle`).
3. Click **Tamper test**: An entry in the ledger is deliberately modified in memory.
4. Click **Verify chain** again: The chain immediately reports a mismatch and identifies the exact broken block.
5. Click **Restore entry**: Reverts the alteration and confirms the ledger is intact.
