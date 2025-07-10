import { executeTx } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';
import { coinWithBalance } from '@mysten/sui/transactions';

import {
  ADMIN_TO_UPDATE,
  MOCK_SUI_MOCK_USDC_POOL,
  MOCK_SUI_TYPE,
  MOCK_USDC_TYPE,
} from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const coinX = coinWithBalance({
    balance: 10_000_000n * 1_000_000_000n,
    type: MOCK_SUI_TYPE,
  });
  const coinY = coinWithBalance({
    balance: 10_000_000n * 1_000_000n,
    type: MOCK_USDC_TYPE,
  });

  const tx = await sdk.deposit({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    coinX,
    coinY,
    admin: ADMIN_TO_UPDATE,
  });

  await executeTx(tx);
})();
