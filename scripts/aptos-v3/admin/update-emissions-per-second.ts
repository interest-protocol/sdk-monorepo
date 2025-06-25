import { TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { interestV3, TEST_POOLS } from '../utils.script';

(async () => {
  const data = interestV3.updateEmissionsPerSecond({
    pool: TEST_POOLS.bardock.WETH_USDC,
    reward: TEST_FAS.bardock.BTC.toString(),
    emissionsPerSecond: 7_000,
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('update-emissions-per-second', tx);
})();
