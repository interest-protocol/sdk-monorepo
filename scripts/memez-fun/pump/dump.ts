import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { pumpSdk, executeTx, testnetPoolId, keypair } = await getEnv();

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const memeCoin = coinWithBalance({
    balance: 1_000_000_000n,
    type: pool.memeCoinType,
  })(tx);

  const { quoteCoin, tx: tx2 } = await pumpSdk.dump({
    pool: testnetPoolId,
    memeCoin,
    tx,
  });

  tx2.transferObjects([quoteCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
