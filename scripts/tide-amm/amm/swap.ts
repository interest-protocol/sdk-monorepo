import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';
import invariant from 'tiny-invariant';

import { SUI_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const { tx, extraCoinIn, coinOut } = await sdk.swap({
    pool: SUI_USDC_POOL,
    amount: 10n * 100_000n,
    xToY: false,
  });

  invariant(extraCoinIn, 'extraCoinIn is null');
  invariant(coinOut, 'coinOut is null');

  tx.transferObjects([extraCoinIn, coinOut], keypair.toSuiAddress());

  await executeTx(tx);
})();
