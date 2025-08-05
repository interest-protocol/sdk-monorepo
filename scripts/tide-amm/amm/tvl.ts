import { logSuccess } from '@interest-protocol/logger';
import { TideSdk } from '@interest-protocol/tide-amm';

import { SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const balances = await sdk.getBalances(SUI_USDC_POOL);

  const prices = await sdk.getPrices(SUI_USDC_POOL);

  const x = (balances.balanceX * prices.priceX) / prices.precision / 10n ** 9n;
  const y = (balances.balanceY * prices.priceY) / prices.precision / 10n ** 6n;

  logSuccess('TVL', x + y);
})();
