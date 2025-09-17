import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE, SUI_USDC_POOL } from '../utils.script';

(async () => {
  const sdk = new TideSdk();

  const balances = await sdk.getBalances(SUI_USDC_POOL);

  const { tx, coinX, coinY } = await sdk.withdraw({
    pool: SUI_USDC_POOL,
    amountX: balances.balanceX,
    amountY: balances.balanceY,
    admin: ADMIN_TO_UPDATE,
  });

  tx.transferObjects(
    [coinX!, coinY!],
    tx.pure.address(
      '0xed7ba9119e330d5032637eb573a4078e6c80c2ae17e3c77382a90fc2fe640f92'
    )
  );

  await executeTx(tx);
})();
