import { logSuccess } from '@interest-protocol/logger';
import { TideSdk } from '@interest-protocol/tide-amm';

import { SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const quote = await sdk.quote({
    pool: SUI_USDC_POOL,
    amount: 10n * 1_000_000_000n,
    xToY: true,
  });

  logSuccess('Quote', quote);
})();
