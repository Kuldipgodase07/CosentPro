'use strict';
// Gemini on Vertex AI, called from Cloud Functions only. The browser never holds a key.
const { GoogleGenAI, Type } = require('@google/genai');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GCLOUD_PROJECT,
  location: process.env.VERTEX_LOCATION || 'asia-south1',
});

/** Strip direct identifiers before text leaves our boundary. */
function redact(text) {
  return String(text || '')
    .slice(0, 6000)
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/\b(?:\+?91[- ]?)?[6-9]\d{9}\b/g, '[phone]')
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[id]')
    .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '[id]');
}

async function ask(system, user, schema) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: user,
    config: { systemInstruction: system, responseMimeType: 'application/json', responseSchema: schema, temperature: 0.2 },
  });
  return JSON.parse(res.text);
}

const S = (d) => ({ type: Type.STRING, description: d });
const DATA = ['contact', 'location', 'financial', 'device', 'health', 'identity'];
const PURP = ['marketing', 'analytics', 'sharing', 'credit', 'profiling', 'service'];

const LINT_SYSTEM = `You review consent notices against India's Digital Personal Data Protection Act, 2023.
Return exactly nine checks with these ids and sections: notice (s.5), bundle (s.6(1)), purposes (s.6(1)), pre (s.6(1)),
withdraw (s.6(4)), retain (s.8(7)), rights (s.5(1)), share (s.5), plain (s.5). st is ok, warn or fail.
Each msg is one plain sentence. Extract one card per distinct purpose, using only the allowed data and purpose codes.
Never invent facts that are not in the text. If a retention period is not stated, dur is null. score is 0 to 100.`;

const lint = async ({ text }) => ask(LINT_SYSTEM, redact(text), {
  type: Type.OBJECT, required: ['org', 'checks', 'score', 'cards'],
  properties: {
    org: S('Name of the organisation, or "This organisation"'),
    score: { type: Type.INTEGER },
    checks: { type: Type.ARRAY, items: { type: Type.OBJECT, required: ['id', 'sec', 'label', 'st', 'msg'], properties: { id: S('check id'), sec: S('DPDP section'), label: S('short label'), st: { type: Type.STRING, enum: ['ok', 'warn', 'fail'] }, msg: S('one sentence') } } },
    cards: { type: Type.ARRAY, items: { type: Type.OBJECT, required: ['p', 'd'], properties: { p: { type: Type.STRING, enum: PURP }, d: { type: Type.ARRAY, items: { type: Type.STRING, enum: DATA } }, dur: { type: Type.OBJECT, nullable: true, properties: { n: { type: Type.INTEGER }, u: { type: Type.STRING, enum: ['day', 'month', 'year'] } } } } } },
  },
});

const TRIAGE_SYSTEM = `You triage messages from Data Principals under the DPDP Act, 2023.
type is one of Access (s.11), Correction (s.12(1)), Erasure (s.12(3)), Nomination (s.14), Grievance (s.13) or Withdrawal (s.6(4)).
Withdrawal means the person only wants to stop a use, which is handled as a consent revocation, not a rights request.
Give 3 to 5 concrete steps, a polite draft reply of at most 70 words, and flags for identity verification, urgency, or lawful retention.
The draft must never promise deletion of data the organisation must keep by law.`;

const triage = async ({ text }) => {
  const o = await ask(TRIAGE_SYSTEM, redact(text), {
    type: Type.OBJECT, required: ['type', 'sec', 'priority', 'steps', 'draft', 'flags', 'match'],
    properties: { type: { type: Type.STRING, enum: ['Access', 'Correction', 'Erasure', 'Nomination', 'Grievance', 'Withdrawal'] }, sec: S('section'), priority: { type: Type.STRING, enum: ['Normal', 'High'] }, steps: { type: Type.ARRAY, items: { type: Type.STRING } }, draft: S('draft reply'), flags: { type: Type.ARRAY, items: { type: Type.STRING } }, match: S('the words that decided the type') },
  });
  return { ...o, due: Date.now() + 30 * 864e5 };
};

const ADVISE_SYSTEM = `You are a DPDP compliance advisor. You receive a list of obligations with a status of done, partial or gap.
Pick the four most urgent that are not done. For each give 2 to 3 concrete steps and the owner role (DPO, Developer or Admin).
Prefer gaps over partials, and larger statutory penalty ceilings first. Do not predict penalties.`;

const advise = async ({ obligations }) => {
  const list = (obligations || []).map(([sec, title, , st, go]) => ({ sec, title, st, go }));
  const o = await ask(ADVISE_SYSTEM, JSON.stringify(list), {
    type: Type.OBJECT, required: ['items'],
    properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, required: ['sec', 'title', 'st', 'steps', 'owner', 'go'], properties: { sec: S('section'), title: S('title'), st: { type: Type.STRING, enum: ['partial', 'gap'] }, ceil: S('penalty ceiling text or empty'), steps: { type: Type.ARRAY, items: { type: Type.STRING } }, owner: S('owner role'), go: S('route id from the input') } } } },
  });
  return { ...o, ready: list.filter((x) => x.st === 'done').length, total: list.length };
};

module.exports = { lint, triage, advise, MODEL };
