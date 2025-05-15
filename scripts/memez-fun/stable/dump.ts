import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { stableSdk, executeTx, testnetStablePoolId, keypair } = await getEnv();

  const pool = await stableSdk.getStablePool(testnetStablePoolId);

  const memeCoin = coinWithBalance({
    balance: 1_000_000_000n,
    type: pool.memeCoinType,
  })(tx);

  const { quoteCoin, tx: tx2 } = await stableSdk.dump({
    pool: testnetStablePoolId,
    memeCoin,
    tx,
  });

  tx2.transferObjects([quoteCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
