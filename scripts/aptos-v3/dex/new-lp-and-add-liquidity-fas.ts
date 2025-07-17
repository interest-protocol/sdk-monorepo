import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';
import { MAX_TICK, MIN_TICK } from '@interest-protocol/v3-core';

import { interestV3, POW_10_6, POW_10_8, TEST_POOLS } from '../utils.script';

(async () => {
  const wethAmount = 1n * POW_10_8;
  const usdcAmount = 2_500n * POW_10_6;

  const data = interestV3.newLpAndAddLiquidityFAs({
    pool: TEST_POOLS.bardock.WETH_USDC,
    amount0: wethAmount,
    amount1: usdcAmount,
    lowerTick: MIN_TICK / 3,
    upperTick: MAX_TICK / 2,
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('new-lp-and-add-liquidity-fas', tx);
})();
