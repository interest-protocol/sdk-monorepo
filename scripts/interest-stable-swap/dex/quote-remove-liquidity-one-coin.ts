import { COIN_TYPES, POOLS } from '@interest-protocol/interest-stable-swap-sdk';
import { logSuccess } from '@interest-protocol/utils';

import { stableSwapSDK } from '../utils.script';

(async () => {
  const result = await stableSwapSDK.quoteRemoveLiquidityOneCoin({
    pool: POOLS.WAL_WWAL.objectId,
    lpCoinAmount: 1_000_000_000n,
    coinOutType: COIN_TYPES.WWAL,
  });

  logSuccess(result);
})();
