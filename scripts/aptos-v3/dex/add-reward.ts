import { TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { interestV3, POW_10_8, TEST_POOLS } from '../utils.script';

(async () => {
  const data = interestV3.addReward({
    pool: TEST_POOLS.bardock.WETH_USDC,
    reward: TEST_FAS.bardock.BTC.toString(),
    amount: 2n * POW_10_8,
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('add-reward', tx);
})();
