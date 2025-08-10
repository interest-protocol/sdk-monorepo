import { logSuccess } from '@interest-protocol/logger';
import { TideSdk } from '@interest-protocol/tide-amm';

import { SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const [quote1, quote2, price] = await Promise.all([
    sdk.quote({
      pool: SUI_USDC_POOL,
      amount: 1n * 1_000_000_000n,
      xToY: true,
    }),
    sdk.quote({
      pool: SUI_USDC_POOL,
      amount: 1_000n * 1_000_000_000n,
      xToY: true,
    }),
    sdk.getPrices(SUI_USDC_POOL),
  ]);

  let quote1Amount = Number(quote1.amountOut) / 1_000_000;
  let quote2Amount = Number(quote2.amountOut) / 1_000_000 / 1_000;
  let priceAmount = Number(price.priceX) / Number(price.precision);

  logSuccess('Price', priceAmount);
  logSuccess('Quote-1', quote1Amount);
  logSuccess('Quote-2', quote2Amount);
  logSuccess(
    'percentage difference',
    (quote1Amount - quote2Amount) / quote1Amount
  );
})();
