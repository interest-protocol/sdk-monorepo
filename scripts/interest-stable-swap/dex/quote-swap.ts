import { COIN_TYPES, POOLS } from '@interest-protocol/interest-stable-swap-sdk';
import { logSuccess } from '@interest-protocol/utils';

import { stableSwapSDK } from '../utils.script';

(async () => {
  const result = await stableSwapSDK.quoteSwap({
    pool: POOLS.WAL_WWAL.objectId,
    coinInType: COIN_TYPES.WAL,
    coinOutType: COIN_TYPES.WWAL,
    amountIn: 1_000_000_000n,
  });

  logSuccess(result);
})();
