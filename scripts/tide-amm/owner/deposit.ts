import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';
import { coinWithBalance } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

import { ADMIN_TO_UPDATE, SUI_USDC_POOL, USDC_TYPE } from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const coinX = coinWithBalance({
    balance: 3_010n * 1_000_000_000n,
    type: SUI_TYPE_ARG,
  });

  const coinY = coinWithBalance({
    balance: 13_791n * 1_000_000n,
    type: USDC_TYPE,
  });

  const tx2 = await sdk.deposit({
    pool: SUI_USDC_POOL,
    coinX,
    coinY,
    admin: ADMIN_TO_UPDATE,
  });

  await executeTx(tx2);
})();
