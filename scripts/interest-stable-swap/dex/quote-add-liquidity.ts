import { POOLS } from '@interest-protocol/interest-stable-swap-sdk';
import { logSuccess } from '@interest-protocol/utils';

import { stableSwapSDK } from '../utils.script';

(async () => {
  const result = await stableSwapSDK.quoteAddLiquidity({
    pool: POOLS.WAL_WWAL.objectId,
    amountsIn: [1_000_000_000n, 1_000_000_000n],
  });

  logSuccess(result);
})();
