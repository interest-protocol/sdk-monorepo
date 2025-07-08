import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { JOSE_ADMIN, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = JOSE_ADMIN;

const PRECISION = TideSdk.PRECISION;

(async () => {
  const tx = sdk.setPrices({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    priceX: 5n * PRECISION,
    priceY: PRECISION,
    admin,
  });

  await executeTx(tx);
})();
