import { COIN_TYPES, POOLS } from '@interest-protocol/interest-stable-swap-sdk';
import { executeTx, keypair } from '@interest-protocol/utils';
import { coinWithBalance } from '@mysten/sui/transactions';

import { stableSwapSDK } from '../utils.script';

(async () => {
  const lpCoin = coinWithBalance({
    type: COIN_TYPES.WAL_WWAL,
    balance: 1_000_000_000n,
  });

  const { returnValues: coin, tx } = await stableSwapSDK.removeLiquidityOneCoin(
    {
      pool: POOLS.WAL_WWAL.objectId,
      lpCoin,
      coinOutType: COIN_TYPES.WAL,
    }
  );

  tx.transferObjects([coin], keypair.toSuiAddress());

  await executeTx(tx);
})();
