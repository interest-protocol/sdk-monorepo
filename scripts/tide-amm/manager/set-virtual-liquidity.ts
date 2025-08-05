import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = ADMIN_TO_UPDATE;

(async () => {
  const tx = sdk.setVirtualXLiquidity({
    pool: SUI_USDC_POOL,
    virtualLiquidityX: 20_000_000n * 10n ** 18n,
    admin,
  });

  await executeTx(tx);
})();
