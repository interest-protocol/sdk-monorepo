import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin =
  '0xce8d4a16004aaeec7c6fffcc1c83f355c77c3526d24f95e4149442990b4bce66';

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
