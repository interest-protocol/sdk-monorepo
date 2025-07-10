import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = ADMIN_TO_UPDATE;

(async () => {
  const tx = sdk.setPauseYtoX({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    admin,
    paused: false,
  });

  await executeTx(tx);
})();
