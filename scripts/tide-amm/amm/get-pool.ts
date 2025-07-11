import { logSuccess } from '@interest-protocol/logger';
import { TideSdk } from '@interest-protocol/tide-amm';

import { SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const pool = await sdk.getPool(SUI_USDC_POOL);

  logSuccess('Pool', pool);
})();
