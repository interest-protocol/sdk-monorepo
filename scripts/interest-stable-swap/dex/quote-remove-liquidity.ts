import { POOLS } from '@interest-protocol/interest-stable-swap-sdk';
import { logSuccess } from '@interest-protocol/logger';

import { stableSwapSDK } from '../utils.script';

(async () => {
  const result = await stableSwapSDK.quoteRemoveLiquidity({
    pool: POOLS.WAL_WWAL.objectId,
    lpCoinAmount: 1_000_000_000n,
  });

  logSuccess(result);
})();
