import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';

import { curveMainnetSDK } from '../utils';

const POW_9 = 1000000000n;

(async () => {
  const data = await curveMainnetSDK.quoteRemoveLiquidity({
    pool: WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString(),
    amountIn: POW_9,
  });

  logSuccess('quote', data);
})();
