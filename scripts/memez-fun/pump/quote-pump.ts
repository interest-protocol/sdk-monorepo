import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId, POW_10_9 } = await getEnv();

  const x = await pumpSdk.quotePump({
    pool: testnetPoolId,
    amount: 15n * POW_10_9,
  });

  logSuccess(x);
})();
