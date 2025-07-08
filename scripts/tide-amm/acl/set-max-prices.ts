import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { JOSE_ADMIN, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = JOSE_ADMIN;

const PRECISION = BigInt(10 ** 18);

(async () => {
  const tx = sdk.setMaxPrices({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    maxPriceX: 6n * PRECISION,
    maxPriceY: 2n * PRECISION,
    minPriceX: 2n * PRECISION,
    minPriceY: PRECISION / 2n,
    admin,
  });

  await executeTx(tx);
})();
