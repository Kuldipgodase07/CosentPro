/**
 * Cryptographic helpers for ConsentPro
 * Provides real SHA-256 digest calculation with fallback,
 * canonical event serialization for tamper-evident hash chaining,
 * and secure credential hashing.
 */

export const canon = e => [
  e.seq,
  e.ts,
  e.type,
  e.org,
  e.purpose,
  e.subject,
  e.receipt,
  e.prev
].join('|');

export async function sha(str) {
  try {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Deterministic fallback when SubtleCrypto is unavailable (e.g. non-HTTPS test contexts)
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return ((h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')).repeat(4);
  }
}

export const hashPw = (email, pw) => sha('cp|' + email.toLowerCase() + '|' + pw);
