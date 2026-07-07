// Envelope decryption (Web Crypto, no dependencies).
// Repo ships only: payload.enc (AES-256-GCM ciphertext) + keyring.json
// (per-audience PBKDF2-wrapped content keys). See tools/seal.mjs.

const PBKDF2_ITERATIONS = 600_000;

const b64ToBuf = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function deriveWrappingKey(code, salt) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

let cache = null;
async function loadArtifacts() {
  if (cache) return cache;
  const [keyringRes, payloadRes] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}keyring.json`),
    fetch(`${import.meta.env.BASE_URL}payload.enc`),
  ]);
  if (!keyringRes.ok || !payloadRes.ok) return null;
  cache = {
    keyring: await keyringRes.json(),
    payload: new Uint8Array(await payloadRes.arrayBuffer()),
  };
  return cache;
}

export async function tryUnlock(code) {
  if (!globalThis.crypto?.subtle) {
    // Web Crypto requires a secure context (HTTPS or localhost).
    return { ok: false, reason: 'insecure-context' };
  }
  let artifacts;
  try {
    artifacts = await loadArtifacts();
  } catch {
    return { ok: false };
  }
  if (!artifacts) return { ok: false };

  for (const entry of artifacts.keyring.entries) {
    try {
      const salt = b64ToBuf(entry.salt);
      const iv = b64ToBuf(entry.iv);
      const wrapped = b64ToBuf(entry.wrapped);
      const wrappingKey = await deriveWrappingKey(code, salt);
      // GCM auth tag failure throws → wrong code for this entry.
      const inner = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, wrappingKey, wrapped);
      const { contentKey, greeting, audience } = JSON.parse(new TextDecoder().decode(inner));

      const ck = await crypto.subtle.importKey('raw', b64ToBuf(contentKey), 'AES-GCM', false, ['decrypt']);
      const pIv = artifacts.payload.slice(0, 12);
      const pCipher = artifacts.payload.slice(12);
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: pIv }, ck, pCipher);
      const story = JSON.parse(new TextDecoder().decode(plain));

      return { ok: true, story, greeting, audience, episodeCount: story.episodes?.length };
    } catch {
      continue;
    }
  }
  return { ok: false };
}
