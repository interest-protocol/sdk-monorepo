import {
  MAINNET_POOLS,
  WHITELISTED_CURVE_LP_COINS,
} from '@interest-protocol/interest-aptos-curve';
import { returnIfDefinedOrThrow } from '@interest-protocol/lib';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK, POW_6, POW_8 } from '../utils';

(async () => {
  const data = curveMainnetSDK.addLiquidity({
    pool: returnIfDefinedOrThrow(
      MAINNET_POOLS[WHITELISTED_CURVE_LP_COINS.MUSD_USDCe_STABLE.toString()],
      'Pool not found'
    ).address.toString(),
    fasIn: [WHITELISTED_FAS.USDCe.toString(), WHITELISTED_FAS.MUSD.toString()],
    amounts: [BigInt(Math.floor(0.1 * POW_6)), BigInt(Math.floor(0.1 * POW_8))],
    recipient: account.accountAddress.toString(),
    minAmountOut: 0n,
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('add-liquidity', transactionResponse.hash);
})();
