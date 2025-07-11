import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, SUI_USDC_POOL } from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const { tx, coinX, coinY } = await sdk.withdraw({
    pool: SUI_USDC_POOL,
    amountX: 2_000_000_000n,
    amountY: 0n,
    admin: ADMIN_TO_UPDATE,
  });

  tx.transferObjects([coinX!, coinY!], keypair.toSuiAddress());

  await executeTx(tx);
})();
