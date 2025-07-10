import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import {
  ADMIN_TO_UPDATE,
  MOCK_SUI_TYPE,
  MOCK_USDC_TYPE,
  PRICE_FEED_SUI_USD,
  PRICE_FEED_USDC_USD,
} from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const { tx, pool } = await sdk.newPool({
    admin: ADMIN_TO_UPDATE,
    xType: MOCK_SUI_TYPE,
    yType: MOCK_USDC_TYPE,
    virtualLiquidity: 1_000_000n * TideSdk.PRECISION,
    feedX: PRICE_FEED_SUI_USD,
    feedY: PRICE_FEED_USDC_USD,
  });

  sdk.share({
    tx,
    pool,
  });

  await executeTx(tx);
})();
