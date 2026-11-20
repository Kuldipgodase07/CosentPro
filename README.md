# ConsentPro — Enterprise Privacy & Consent Management Platform

[![DPDP Act 2023](https://img.shields.io/badge/Compliance-DPDP%20Act%202023-blue.svg)](https://www.meity.gov.in/)
[![GDPR Aligned](https://img.shields.io/badge/Privacy-GDPR%20Aligned-977DFF.svg)](https://gdpr.eu/)
[![Google Cloud](https://img.shields.io/badge/Cloud-Google%20Cloud%20%7C%20Firebase-0033FF.svg)](https://cloud.google.com/)
[![Google DeepMind](https://img.shields.io/badge/AI-Gemini%202.5%20Flash%20on%20Vertex%20AI-0600AB.svg)](https://deepmind.google/)

ConsentPro is a privacy-by-design Consent Management & Auditing Platform (CMP) built specifically for India's **Digital Personal Data Protection (DPDP) Act, 2023** and **GDPR**. It turns consent collection from a liability into verifiable, cryptographic evidence.

---

## 🌟 Key Features

1. **Granular Consent & Withdrawal Parity (DPDP Section 6)**: Itemized switches for every purpose; withdrawal as effortless as granting with instant downstream webhook propagation.
2. **Immutable Cryptographic Audit Ledger**: Append-only SHA-256 hash chain with real-time tamper-evident verification.
3. **Gemini on Vertex AI (DeepMind Integration)**:
   - **Notice Linter**: Validates privacy notices against DPDP requirements, detects bundling, and scores compliance.
   - **Rights Request Triage**: Automates Data Principal Rights (DSR) triage and SLA tracking.
   - **Statutory Gap Advisor**: Identifies fiduciary exposures and computes statutory penalty ceilings (up to ₹250 crore).
4. **Five Persona-Driven Workspaces**:
   - **Citizen (Data Principal)**: Purpose management, cryptographic receipts, privacy assistant.
   - **Data Protection Officer (DPO)**: Compliance command center, DPDP obligation matrix, DSR queue.
   - **Developer**: API keys (`cp_live_...`), SDK integration, Kantara/FHIR/OIDC compliance test suites.
   - **Auditor**: Merkle hash chain verification, live block tamper simulator, audit certificates.
   - **Admin**: Multi-tenant isolation, team access, audit trail.

---

## 📁 Repository Structure

```
├── frontend/                     # Dynamic, production-level modular frontend project
│   ├── index.html                # HTML5 entry with Google Sans Flex & importmaps
│   ├── server.js                 # Zero-dependency instant local SPA server
│   ├── package.json              # Project scripts and Vite configuration
│   ├── public/                   # Static assets and runtime Firebase configuration
│   └── src/
│       ├── core/                 # Cryptography (SHA-256), State store (S), Router, Constants
│       ├── components/           # Icons (45 SVG glyphs), Charts, Modals, Sidebar, Topbar
│       ├── services/             # Ledger, Simulation, Gemini AI Engine, Firestore DB
│       └── views/                # Role views (citizen, dpo, developer, auditor, admin, ai, platform)
│
├── ConsentPro_Firebase_Package/  # Google Cloud & Firebase deployment package
│   └── consentpro-firebase/
│       ├── firestore.rules       # Role & tenant-based security rules (server-only ledger writes)
│       ├── functions/            # 2nd-gen Cloud Functions (recordConsent, verifyConsent, Gemini AI)
│       └── public/               # Production hosting distribution
│
└── ConsentPro.html               # Reference design specification prototype
```

---

## ⚡ Quick Start

### Run Locally (Zero Dependencies Needed)
```bash
cd frontend
node server.js
```
Open **`http://localhost:3000`** in any browser.

### Run with Vite Dev Server
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Role Credentials

* **Master Password**: `ConsentPro#1`
* **2FA / MFA Demo Code**: `482913` (or click *"fill it for me"*)

| Role | Name | Email |
|---|---|---|
| **Data Principal** | Aarav Mehta | `aarav@example.com` |
| **DPO** | Meera Nair | `meera@orbitbank.example` |
| **Developer** | Kabir Shah | `kabir@orbitbank.example` |
| **Auditor** | Rhea D’Souza | `rhea@auditfirm.example` |
| **Admin** | Neha Kapoor | `neha@orbitbank.example` |

---

## 📜 License
MIT License. Built for the Google Cloud & Google DeepMind Startup Buildathon.
