import { TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { interestV3, POW_10_6, TEST_POOLS } from '../utils.script';

(async () => {
  const usdcAmount = 10n * POW_10_6;

  const data = interestV3.swapFA({
    pool: TEST_POOLS.bardock.WETH_USDC,
    faInMetadata: TEST_FAS.bardock.USDC.toString(),
    amountIn: usdcAmount,
    sqrtPriceLimitX64: 0n,
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('swap-fa', tx);
})();
