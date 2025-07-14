import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = ADMIN_TO_UPDATE;

(async () => {
  const tx = sdk.removeBlacklist({
    pool: SUI_USDC_POOL,
    admin,
    address: '0x1',
  });

  await executeTx(tx);
})();
