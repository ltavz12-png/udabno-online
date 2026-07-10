/**
 * Provably-fair outcome derivation (crash-family).
 *
 * A round's single hidden outcome — the mortality point M — is derived
 * deterministically from three public inputs:
 *
 *   - serverSeed  : secret until reveal; its SHA-256 hash is published beforehand.
 *   - clientSeed  : chosen by the player.
 *   - nonce       : increments per round for a given seed pair.
 *
 *   digest = HMAC-SHA256(serverSeed, `${clientSeed}:${nonce}`)
 *   u      = first 52 bits of digest, mapped to [0, 1)
 *   M      = mortality(u)                          (see mortality.ts)
 *
 * After the round the server reveals serverSeed; anyone can recompute M and
 * confirm it matches, and confirm sha256(serverSeed) equals the pre-published
 * commitment. See FAIRNESS.md and engine/verify.ts.
 */

import { hmacSha256, utf8, toHex, sha256, fromHex } from './crypto/sha256';

export interface FairnessInputs {
  readonly serverSeed: string;
  readonly clientSeed: string;
  readonly nonce: number;
}

export interface FairnessResult {
  /** Hex HMAC digest — the raw provably-fair output. */
  readonly hmac: string;
  /** Uniform draw in [0, 1) extracted from the digest. */
  readonly u: number;
}

/** Publish sha256(serverSeed) before the round; reveal serverSeed after. */
export function hashServerSeed(serverSeed: string): string {
  return toHex(sha256(utf8(serverSeed)));
}

/**
 * Extract a uniform in [0, 1) from an HMAC digest using its first 52 bits
 * (the full mantissa of a double), the standard bustabit-style extraction.
 */
export function uniformFromDigest(digest: Uint8Array): number {
  // 52 bits = 6.5 bytes. Assemble from the leading 7 bytes, drop 4 low bits.
  let acc = 0;
  for (let i = 0; i < 7; i++) {
    acc = acc * 256 + digest[i];
  }
  // acc now holds 56 bits; keep the top 52 by dividing off the low 4 bits.
  const top52 = Math.floor(acc / 16);
  return top52 / Math.pow(2, 52);
}

export function deriveFairness(inputs: FairnessInputs): FairnessResult {
  const digest = hmacSha256(
    utf8(inputs.serverSeed),
    utf8(`${inputs.clientSeed}:${inputs.nonce}`),
  );
  return { hmac: toHex(digest), u: uniformFromDigest(digest) };
}

/**
 * A second, independent uniform for the same round, used by The Beyond. Derived
 * from a distinct HMAC message so it is statistically independent of M yet still
 * fully reproducible from the same seeds.
 */
export function deriveBeyondUniform(inputs: FairnessInputs): number {
  const digest = hmacSha256(
    utf8(inputs.serverSeed),
    utf8(`${inputs.clientSeed}:${inputs.nonce}:beyond`),
  );
  return uniformFromDigest(digest);
}

/** Verify a revealed server seed matches its pre-published commitment. */
export function verifyServerSeed(serverSeed: string, committedHash: string): boolean {
  return hashServerSeed(serverSeed) === committedHash.trim().toLowerCase();
}

/** Constant-time-ish hex equality for seed hash comparison. */
export function hexEquals(a: string, b: string): boolean {
  const x = fromHex(a);
  const y = fromHex(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
