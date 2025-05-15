import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = curveMainnetSDK.swap({
    pool: WHITELISTED_CURVE_LP_COINS.USDCe_MOVE_VOLATILE.toString(),
    faIn: WHITELISTED_FAS.MOVE.toString(),
    faOut: WHITELISTED_FAS.MOVE.toString(),
    amountIn: 1000n,
    recipient: account.accountAddress.toString(),
    minAmountOut: 0n,
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('swap', transactionResponse);
})();
