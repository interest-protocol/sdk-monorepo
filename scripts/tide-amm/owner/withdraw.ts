import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const { tx, coinX, coinY } = await sdk.withdraw({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    amountX: 9999991000000000n,
    amountY: 9999986770488n,
    admin: ADMIN_TO_UPDATE,
  });

  tx.transferObjects([coinX!, coinY!], keypair.toSuiAddress());

  await executeTx(tx);
})();
