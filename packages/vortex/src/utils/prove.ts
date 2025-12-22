import { getEnv } from './env';
import { VERIFYING_KEY, PROVING_KEY } from '../keys';

// Determine environment once at module load
const env = getEnv();

// Dynamic imports to avoid bundling Node.js-specific code (fs) in browser builds
const getProveFunction = async () => {
  if (env === 'web') {
    const { prove } = await import('../pkg/web/vortex');
    return prove;
  }
  if (env === 'node') {
    const { prove } = await import('../pkg/nodejs/vortex');
    return prove;
  }
  throw new Error('Unsupported environment');
};

const getVerifyFunction = async () => {
  if (env === 'web') {
    const { verify } = await import('../pkg/web/vortex');
    return verify;
  }
  if (env === 'node') {
    const { verify } = await import('../pkg/nodejs/vortex');
    return verify;
  }
  throw new Error('Unsupported environment');
};

export const prove = async (input: string): Promise<string> => {
  const proveFn = await getProveFunction();
  return proveFn(input, PROVING_KEY);
};

export const verify = async (proof: string): Promise<boolean> => {
  const verifyFn = await getVerifyFunction();
  return verifyFn(proof, VERIFYING_KEY);
};
