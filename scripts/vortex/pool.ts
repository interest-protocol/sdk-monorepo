import { getEnv } from './utils.script';
import { logSuccess, logError } from '@interest-protocol/logger';

(async () => {
  try {
    const { vortexSdk, suiVortexPoolObjectId } = await getEnv();

    const vortex = await vortexSdk.getVortexPool(suiVortexPoolObjectId);

    logSuccess('vortex pool: ', vortex);
  } catch (error) {
    logError('vortex pool', error);
  }
})();
