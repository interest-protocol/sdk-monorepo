import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';
import invariant from 'tiny-invariant';

import { JOSE_ADMIN, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = JOSE_ADMIN;

const PRECISION = BigInt(1e18);

(async () => {
  const tx = sdk.setPrices({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    priceX: 5n * PRECISION,
    priceY: PRECISION,
    admin,
  });

  const {
    tx: swapTx,
    extraCoinIn,
    coinOut,
  } = await sdk.swap({
    tx,
    pool: MOCK_SUI_MOCK_USDC_POOL,
    amount: 1n * 1_000_000_000n,
    xToY: true,
  });

  invariant(extraCoinIn, 'extraCoinIn is null');
  invariant(coinOut, 'coinOut is null');

  swapTx.transferObjects([extraCoinIn, coinOut], keypair.toSuiAddress());

  await executeTx(swapTx);
})();
