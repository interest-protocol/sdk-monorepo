import { COIN_TYPES, POOLS } from '@interest-protocol/interest-stable-swap-sdk';
import { executeTx, keypair } from '@interest-protocol/utils';
import { coinWithBalance } from '@mysten/sui/transactions';

import { stableSwapSDK } from '../utils.script';

(async () => {
  const walCoin = coinWithBalance({
    type: COIN_TYPES.WAL,
    balance: 1_000_000_000n,
  });

  const wWalCoin = coinWithBalance({
    type: COIN_TYPES.WWAL,
    balance: 1_000_000_000n,
  });

  const { returnValues: lpCoin, tx } = await stableSwapSDK.addLiquidity({
    pool: POOLS.WAL_WWAL.objectId,
    coins: [walCoin, wWalCoin],
  });

  tx.transferObjects([lpCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
