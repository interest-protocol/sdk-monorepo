import { logSuccess } from '@interest-protocol/logger';

import { interestV3, TEST_POOLS } from '../utils.script';

(async () => {
  const data = await interestV3.getTicks({
    pool: TEST_POOLS.bardock.WETH_USDC,
    firstTick: -443580,
    numberOfTicks: 10,
  });

  logSuccess('get-ticks', data);
})();
