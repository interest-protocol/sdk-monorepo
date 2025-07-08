import { logSuccess } from '@interest-protocol/logger';
import { TideSdk } from '@interest-protocol/tide-amm';

import { MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const pool = await sdk.getPool(MOCK_SUI_MOCK_USDC_POOL);

  logSuccess('Pool', pool);
})();
