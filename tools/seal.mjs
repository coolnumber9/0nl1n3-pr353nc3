#!/usr/bin/env node
// seal.mjs — encrypts story content for the public repo.
//
//   node tools/seal.mjs
//
// Reads:  content/story/episodes.json   (private, gitignored)
//         tools/codes.local.json        (private, gitignored)
// Writes: public/payload.enc            (AES-256-GCM ciphertext — safe to commit)
//         public/keyring.json           (PBKDF2-wrapped content keys — safe to commit)
//
// Threat model note (honest): anyone can brute-force codes OFFLINE against
// keyring.json. 600k PBKDF2 iterations makes each guess cost ~0.3s on a laptop;
// use codes with real entropy (word-word-number or better) for meaningful margin.

import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes, pbkdf2Sync, createCipheriv } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ITERATIONS = 600_000;

const episodes = JSON.parse(readFileSync(resolve(root, 'content/story/episodes.json'), 'utf8'));
const codes = JSON.parse(readFileSync(resolve(root, 'tools/codes.local.json'), 'utf8'));

function gcmEncrypt(key, plaintext) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);
  return { iv, ct }; // ct = ciphertext || 16-byte tag  (WebCrypto layout)
}

// 1. Encrypt the story payload once with a random content key.
const contentKey = randomBytes(32);
const payloadPlain = Buffer.from(JSON.stringify(episodes), 'utf8');
const { iv: pIv, ct: pCt } = gcmEncrypt(contentKey, payloadPlain);
writeFileSync(resolve(root, 'public/payload.enc'), Buffer.concat([pIv, pCt]));

// 2. Wrap the content key once per access code.
const entries = codes.map(({ code, audience, greeting }) => {
  const salt = randomBytes(16);
  const wrappingKey = pbkdf2Sync(code, salt, ITERATIONS, 32, 'sha256');
  const inner = Buffer.from(
    JSON.stringify({ contentKey: contentKey.toString('base64'), audience, greeting }),
    'utf8'
  );
  const { iv, ct } = gcmEncrypt(wrappingKey, inner);
  return { salt: salt.toString('base64'), iv: iv.toString('base64'), wrapped: ct.toString('base64') };
});

// Shuffle so entry order reveals nothing about who was added when.
entries.sort(() => Math.random() - 0.5);

writeFileSync(
  resolve(root, 'public/keyring.json'),
  JSON.stringify({ kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS }, entries }, null, 2)
);

console.log(`sealed ${episodes.episodes.length} episodes for ${entries.length} audience code(s).`);
console.log('commit public/payload.enc and public/keyring.json — never the inputs.');
