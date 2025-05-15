import { Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { pumpSdk, executeTx, testnetPoolId, POW_10_9 } = await getEnv();

  const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(10n * POW_10_9)]);

  const { memeToken, tx: tx2 } = await pumpSdk.pumpToken({
    pool: testnetPoolId,
    quoteCoin,
    tx,
  });

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const { tx: tx3 } = await pumpSdk.keepToken({
    token: memeToken,
    tx: tx2,
    memeCoinType: pool.memeCoinType,
  });

  await executeTx(tx3);
})();
