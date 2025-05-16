import { COIN_TYPES, POOLS } from '@interest-protocol/interest-stable-swap-sdk';
import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { coinWithBalance } from '@mysten/sui/transactions';

import { stableSwapSDK } from '../utils.script';

(async () => {
  const lpCoin = coinWithBalance({
    type: COIN_TYPES.WAL_WWAL,
    balance: 1_000_000_000n,
  });

  const pool = await stableSwapSDK.getPool(POOLS.WAL_WWAL.objectId);

  const { returnValues: coins, tx } = await stableSwapSDK.removeLiquidity({
    pool,
    lpCoin,
  });

  tx.transferObjects(
    pool.coins.map((_, i) => coins[i]!),
    keypair.toSuiAddress()
  );

  await executeTx(tx);
})();
