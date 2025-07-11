import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, SUI_USDC_POOL } from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const tx = await sdk.setMaxAge({
    pool: SUI_USDC_POOL,
    maxAge: 60,
    admin: ADMIN_TO_UPDATE,
  });

  await executeTx(tx);
})();
