import { logSuccess } from '@interest-protocol/logger';

import { interestV3, TEST_POOLS } from '../utils.script';

(async () => {
  const data = await interestV3.headTick(TEST_POOLS.bardock.WETH_USDC);

  logSuccess('head-tick', data);
})();
