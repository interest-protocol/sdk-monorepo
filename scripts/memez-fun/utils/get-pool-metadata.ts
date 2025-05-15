import { logSuccess } from '@interest-protocol/utils';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const r = await pumpSdk.getPoolMetadata({
    poolId: testnetPoolId,
    quoteCoinType: pool.quoteCoinType,
    memeCoinType: pool.memeCoinType,
    curveType: pool.curveType,
  });

  logSuccess(`Pool Metadata: ${JSON.stringify(r, null, 2)}`);
})();
