import { Fees, TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { aptosTestnetClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';
import { PriceEncoder, TickMath } from '@interest-protocol/v3-core';

import { interestV3, POW_10_6, POW_10_8 } from '../utils.script';

(async () => {
  const isSorted = TEST_FAS.WETH.toString() < TEST_FAS.USDC.toString();

  const wethAmount = 1n * POW_10_8;
  const usdcAmount = 2_500n * POW_10_6;

  const sqrtPriceX64 = PriceEncoder.encodeSqrtPriceX64({
    amount0: isSorted ? wethAmount : usdcAmount,
    amount1: isSorted ? usdcAmount : wethAmount,
    decimals0: isSorted ? 8 : 6,
    decimals1: isSorted ? 6 : 8,
  });

  const variance = 35n;

  const lowerTick = TickMath.getTickAtSqrtRatio(
    sqrtPriceX64 - (sqrtPriceX64 * variance) / 100n
  );

  const upperTick = TickMath.getTickAtSqrtRatio(
    sqrtPriceX64 + (sqrtPriceX64 * variance) / 100n
  );

  const payload = interestV3.newPoolAndLiquidityFAs({
    faAMetadata: isSorted ? TEST_FAS.WETH.toString() : TEST_FAS.USDC.toString(),
    faBMetadata: isSorted ? TEST_FAS.USDC.toString() : TEST_FAS.WETH.toString(),
    amountA: isSorted ? wethAmount : usdcAmount,
    amountB: isSorted ? usdcAmount : wethAmount,
    fee: Fees.VOLATILE,
    sqrtPriceX64,
    lowerTick,
    upperTick,
    recipient: account.accountAddress.toString(),
  });

  console.log(payload);

  const tx = await executeTx({
    data: payload,
    client: aptosTestnetClient,
  });

  logSuccess('new-pool-add-liquidity-fas', tx);
})();
