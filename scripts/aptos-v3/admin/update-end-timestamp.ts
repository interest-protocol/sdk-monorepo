import { TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { interestV3, TEST_POOLS } from '../utils.script';

const ONE_WEEK_IN_SECONDS = 604800;

(async () => {
  const data = interestV3.updateEndTimestamp({
    pool: TEST_POOLS.bardock.WETH_USDC,
    reward: TEST_FAS.bardock.BTC.toString(),
    endTimestamp: new Date().getTime() / 1000 + ONE_WEEK_IN_SECONDS,
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('update-end-timestamp', tx);
})();
