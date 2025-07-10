import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = ADMIN_TO_UPDATE;

(async () => {
  const tx = sdk.setVirtualXLiquidity({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    virtualLiquidityX: 1_500_000n * 10n ** 18n,
    admin,
  });

  await executeTx(tx);
})();
