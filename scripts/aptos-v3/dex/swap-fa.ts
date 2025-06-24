import { TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { aptosTestnetClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { interestV3, POW_10_6, TEST_POOLS } from '../utils.script';

(async () => {
  const wethAmount = 10n * POW_10_6;

  const payload = interestV3.swapFA({
    pool: TEST_POOLS.aptos_testnet.WETH_USDC,
    faInMetadata: TEST_FAS.aptos_testnet.WETH.toString(),
    amountIn: wethAmount,
    sqrtPriceLimitX64: 0n,
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data: payload,
    client: aptosTestnetClient,
  });

  logSuccess('swap-fa', tx);
})();
