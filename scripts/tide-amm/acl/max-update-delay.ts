import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin =
  '0xce8d4a16004aaeec7c6fffcc1c83f355c77c3526d24f95e4149442990b4bce66';

(async () => {
  const tx = sdk.setMaxUpdateDelayMs({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    maxUpdateDelayMs: 10_000,
    admin,
  });

  await executeTx(tx);
})();
