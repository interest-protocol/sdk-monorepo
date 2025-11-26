import { prove as proveNode, verify as verifyNode } from '../pkg/nodejs/vortex';
import { prove as proveWeb, verify as verifyWeb } from '../pkg/web/vortex';
import { getEnv } from './env';
import { VERIFYING_KEY, PROVING_KEY } from '../keys';

export const prove = (input: string) => {
  const env = getEnv();
  if (env === 'node') return proveNode(input, PROVING_KEY);
  if (env === 'web') return proveWeb(input, PROVING_KEY);
  throw new Error('Unsupported environment');
};

export const verify = (proof: string) => {
  const env = getEnv();
  if (env === 'node') return verifyNode(proof, VERIFYING_KEY);
  if (env === 'web') return verifyWeb(proof, VERIFYING_KEY);
  throw new Error('Unsupported environment');
};
