import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { JOSE_ADMIN, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = JOSE_ADMIN;

const PRECISION = BigInt(10 ** 18);

(async () => {
  const tx = sdk.setPrices({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    priceX: 5n * PRECISION,
    priceY: PRECISION,
    admin,
  });

  await executeTx(tx);

  const quote = await sdk.quote({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    amount: 1n * 1_000_000_000n,
    xToY: true,
  });

  logSuccess('Quote', quote);
})();
