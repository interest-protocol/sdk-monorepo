import { getEnv } from '../utils.script';
import { logSuccess, logError } from '@interest-protocol/logger';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

(async () => {
  try {
    const { vortexSdk } = await getEnv();

    const vortex = await vortexSdk.vortexAddress(SUI_TYPE_ARG);

    logSuccess('vortex', vortex);
  } catch (error) {
    logError('vortex', error);
  }
})();
