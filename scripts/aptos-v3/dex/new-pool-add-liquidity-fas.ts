import { Fees, TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';
import { MAX_TICK, MIN_TICK } from '@interest-protocol/v3-core';

import { interestV3, POW_10_6, POW_10_8 } from '../utils.script';

const WETH = TEST_FAS.bardock.WETH.toString();
const USDC = TEST_FAS.bardock.USDC.toString();

(async () => {
  const isSorted = WETH < USDC;

  const wethAmount = 1n * POW_10_8;
  const usdcAmount = 2_500n * POW_10_6;

  const payload = interestV3.newPoolAndLiquidityFAs({
    faAMetadata: isSorted ? WETH : USDC,
    faBMetadata: isSorted ? USDC : WETH,
    amountA: isSorted ? wethAmount : usdcAmount,
    amountB: isSorted ? usdcAmount : wethAmount,
    fee: Fees.VOLATILE,
    lowerTick: MIN_TICK,
    upperTick: MAX_TICK,
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data: payload,
    client: bardockClient,
  });

  logSuccess('new-pool-add-liquidity-fas', tx);
})();
