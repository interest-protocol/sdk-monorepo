import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId, POW_10_9 } = await getEnv();

  const amount = 1n * POW_10_9;

  const x = await pumpSdk.quoteDump({
    pool: testnetPoolId,
    amount,
  });

  logSuccess('quote-dump', x);
  logSuccess('burn percentage', (Number(x.burnFee) * 100) / Number(amount));
})();
