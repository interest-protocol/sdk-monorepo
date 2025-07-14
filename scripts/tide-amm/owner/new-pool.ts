import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

import {
  ADMIN_TO_UPDATE,
  PRICE_FEED_SUI_USD,
  PRICE_FEED_USDC_USD,
  USDC_TYPE,
} from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const { tx, pool } = await sdk.newPool({
    admin: ADMIN_TO_UPDATE,
    xType: SUI_TYPE_ARG,
    yType: USDC_TYPE,
    virtualLiquidity: 2_500_000n * TideSdk.PRECISION,
    feedX: PRICE_FEED_SUI_USD,
    feedY: PRICE_FEED_USDC_USD,
  });

  sdk.share({
    tx,
    pool,
  });

  await executeTx(tx);
})();
