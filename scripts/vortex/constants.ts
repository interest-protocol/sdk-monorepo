import { OPT } from '@interest-protocol/vortex-sdk';
import { logInfo } from '@interest-protocol/logger';
// For 4 poseidon arguments: t = 5, index = t - 2 = 3
export const C = OPT.C[3]!;
export const S = OPT.S[3]!;
export const M = OPT.M[3]!;
export const P = OPT.P[3]!;

(() => {
  logInfo({
    S,
  });
})();
