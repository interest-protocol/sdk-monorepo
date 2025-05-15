import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = curveMainnetSDK.removeLiquidity({
    pool: WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString(),
    amount: 1_147_177_934n,
    recipient: account.accountAddress.toString(),
    minAmountsOut: [0n, 0n, 0n, 0n, 0n, 0n, 0n],
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('remove-liquidity', transactionResponse);
})();
