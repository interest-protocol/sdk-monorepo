import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { stableSdk, testnetStablePoolId, POW_10_9 } = await getEnv();

  const x = await stableSdk.quotePump({
    pool: testnetStablePoolId,
    amount: 20n * POW_10_9,
  });

  logSuccess('quote-pump', x);
})();
