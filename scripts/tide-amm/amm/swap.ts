import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';
import invariant from 'tiny-invariant';

import { MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

(async () => {
  const { tx, extraCoinIn, coinOut } = await sdk.swap({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    amount: 1n * 1_000_000_000n,
    xToY: true,
  });

  invariant(extraCoinIn, 'extraCoinIn is null');
  invariant(coinOut, 'coinOut is null');

  tx.transferObjects([extraCoinIn, coinOut], keypair.toSuiAddress());

  await executeTx(tx);
})();
