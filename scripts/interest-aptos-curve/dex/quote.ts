import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';

import { curveMainnetSDK } from '../utils';

const POW_8 = 100000000n;

(async () => {
  const data = await curveMainnetSDK.quoteAddLiquidity({
    pool: WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString(),
    amountsIn: [BigInt(Math.floor(0.6 * 100000000)), 3500n * POW_8],
  });

  logSuccess('quote', data);
})();
