import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = ADMIN_TO_UPDATE;

(async () => {
  const tx = sdk.setFeeX({
    pool: SUI_USDC_POOL,
    feeX: 0.0003 * 1e9,
    admin,
  });

  await executeTx(tx);
})();
