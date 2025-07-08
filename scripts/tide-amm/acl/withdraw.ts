import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { JOSE_ADMIN, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const { tx, coinX, coinY } = await sdk.withdraw({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    amountX: 10n * 1_000_000_000n,
    amountY: 10n * 1_000_000n,
    admin: JOSE_ADMIN,
  });

  tx.transferObjects([coinX!, coinY!], keypair.toSuiAddress());

  await executeTx(tx);
})();
