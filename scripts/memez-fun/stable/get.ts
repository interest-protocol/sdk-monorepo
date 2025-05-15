import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { stableSdk, testnetStablePoolId } = await getEnv();

  const r = await stableSdk.getStablePool(testnetStablePoolId);

  logSuccess('get-stable-pool', r);
})();
