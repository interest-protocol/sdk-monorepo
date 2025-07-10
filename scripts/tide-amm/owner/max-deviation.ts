import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const tx = await sdk.setMaxDeviationPercentage({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    maxDeviationPercentage: (TideSdk.PRECISION * 5n) / 1_000n,
    admin: ADMIN_TO_UPDATE,
  });

  await executeTx(tx);
})();
