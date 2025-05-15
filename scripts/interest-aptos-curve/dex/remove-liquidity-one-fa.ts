import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = curveMainnetSDK.removeLiquidityOneFa({
    pool: WHITELISTED_CURVE_LP_COINS.USDCe_WETHe_VOLATILE.toString(),
    faOut: WHITELISTED_FAS.WETHe.toString(),
    amount: 10_000n,
    recipient: account.accountAddress.toString(),
    minAmountOut: 0n,
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('remove-liquidity-one-fa', transactionResponse);
})();
