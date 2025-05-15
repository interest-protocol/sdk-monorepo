import { POOLS } from '@interest-protocol/interest-stable-swap-sdk';
import { logSuccess } from '@interest-protocol/utils';

import { stableSwapSDK } from '../utils.script';

(async () => {
  const pool = await stableSwapSDK.getPool(POOLS.WAL_WWAL.objectId);

  logSuccess(pool);
})();
