import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { JOSE_ADMIN, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = JOSE_ADMIN;

(async () => {
  const tx = sdk.setFeeX({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    feeX: 0.0005 * 1e9,
    admin,
  });

  await executeTx(tx);
})();
