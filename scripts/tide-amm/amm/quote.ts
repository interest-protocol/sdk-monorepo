import { logSuccess } from '@interest-protocol/logger';
import { TideSdk } from '@interest-protocol/tide-amm';

import { MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const quote = await sdk.quote({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    amount: 1n * 1_000_000_000n,
    xToY: true,
  });

  logSuccess('Quote', quote);
})();
