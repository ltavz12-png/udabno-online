/**
 * Standalone round verification — usable as a library function, in the /verify
 * UI, or from the CLI. Given the revealed serverSeed, the clientSeed, the nonce
 * and the pre-published server-seed hash, it independently reproduces the
 * round's mortality point M and confirms the commitment.
 *
 * CLI usage:
 *   npx tsx engine/verify.ts <serverSeed> <clientSeed> <nonce> [committedHash] [houseEdge]
 */

import { DEFAULT_CONFIG } from './config';
import { deriveFairness, deriveBeyondUniform, hashServerSeed } from './fairness';
import { mortalityFromUniform, displayMultiplier } from './mortality';
import { beyondProbabilities } from './beyond';

export interface VerificationReport {
  readonly serverSeed: string;
  readonly clientSeed: string;
  readonly nonce: number;
  readonly serverSeedHash: string;
  readonly commitmentMatches: boolean | null;
  readonly hmac: string;
  readonly uniform: number;
  readonly mortality: number;
  readonly mortalityDisplay: number;
  readonly beyondUniform: number;
}

export function verifyRound(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  committedHash?: string,
  houseEdge: number = DEFAULT_CONFIG.houseEdge,
): VerificationReport {
  const { hmac, u } = deriveFairness({ serverSeed, clientSeed, nonce });
  const mortality = mortalityFromUniform(u, houseEdge);
  const serverSeedHash = hashServerSeed(serverSeed);
  return {
    serverSeed,
    clientSeed,
    nonce,
    serverSeedHash,
    commitmentMatches: committedHash
      ? serverSeedHash === committedHash.trim().toLowerCase()
      : null,
    hmac,
    uniform: u,
    mortality,
    mortalityDisplay: displayMultiplier(mortality),
    beyondUniform: deriveBeyondUniform({ serverSeed, clientSeed, nonce }),
  };
}

// CLI entrypoint (Node/tsx). Guarded so importing this module has no side effects.
declare const process: { argv: string[]; exit(code: number): never } | undefined;
if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1]?.includes('verify')) {
  const [, , serverSeed, clientSeed, nonceStr, committedHash, edgeStr] = process.argv;
  if (!serverSeed || !clientSeed || nonceStr === undefined) {
    // eslint-disable-next-line no-console
    console.log(
      'Usage: tsx engine/verify.ts <serverSeed> <clientSeed> <nonce> [committedHash] [houseEdge]',
    );
    process.exit(1);
  }
  const report = verifyRound(
    serverSeed,
    clientSeed,
    Number(nonceStr),
    committedHash,
    edgeStr ? Number(edgeStr) : undefined,
  );
  const probs = beyondProbabilities(0.5, DEFAULT_CONFIG.beyond);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ...report, beyondProbabilitiesAtBoldness0_5: probs }, null, 2));
}
