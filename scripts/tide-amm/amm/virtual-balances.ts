import { logSuccess } from '@interest-protocol/logger';
import { TideSdk } from '@interest-protocol/tide-amm';

import { SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const virtualBalances = await sdk.virtualBalances(SUI_USDC_POOL);

  logSuccess('Virtual Balances', virtualBalances);
})();
