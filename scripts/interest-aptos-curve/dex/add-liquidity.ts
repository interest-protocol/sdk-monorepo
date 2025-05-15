import {
  MAINNET_POOLS,
  WHITELISTED_CURVE_LP_COINS,
} from '@interest-protocol/interest-aptos-curve';
import { returnIfDefinedOrThrow } from '@interest-protocol/lib';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK, POW_8, POW_8BN } from '../utils';

(async () => {
  const data = curveMainnetSDK.addLiquidity({
    pool: returnIfDefinedOrThrow(
      MAINNET_POOLS[WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString()],
      'Pool not found'
    ).address.toString(),
    fasIn: [WHITELISTED_FAS.WETHe.toString(), WHITELISTED_FAS.MOVE.toString()],
    amounts: [BigInt(Math.floor(0.5 * POW_8)), 3662n * POW_8BN],
    recipient: account.accountAddress.toString(),
    minAmountOut: 0n,
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('add-liquidity', transactionResponse.hash);
})();
