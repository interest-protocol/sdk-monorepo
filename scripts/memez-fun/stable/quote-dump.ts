import { logSuccess } from '@interest-protocol/utils';

import { getEnv } from '../utils.script';

(async () => {
  const { stableSdk, testnetStablePoolId, POW_10_9 } = await getEnv();

  const x = await stableSdk.quoteDump({
    pool: testnetStablePoolId,
    amount: 15n * POW_10_9,
  });

  logSuccess(x);
})();
