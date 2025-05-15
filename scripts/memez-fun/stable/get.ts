import { logSuccess } from '@interest-protocol/utils';

import { getEnv } from '../utils.script';

(async () => {
  const { stableSdk, testnetStablePoolId } = await getEnv();

  const r = await stableSdk.getStablePool(testnetStablePoolId);

  logSuccess(r);
})();
