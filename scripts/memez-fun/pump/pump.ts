import { Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { pumpSdk, executeTx, testnetPoolId, keypair, POW_10_9 } =
    await getEnv();

  const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(5n * POW_10_9)]);

  const { memeCoin, tx: tx2 } = await pumpSdk.pump({
    pool: testnetPoolId,
    quoteCoin,
    tx,
  });

  tx2.transferObjects([memeCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
