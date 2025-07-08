import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { JOSE_ADMIN, MOCK_SUI_TYPE, MOCK_USDC_TYPE } from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const { tx, pool } = await sdk.newPool({
    admin: JOSE_ADMIN,
    xType: MOCK_SUI_TYPE,
    yType: MOCK_USDC_TYPE,
    virtualLiquidity: 1_000_000n * TideSdk.PRECISION,
  });

  sdk.share({
    tx,
    pool,
  });

  await executeTx(tx);
})();
