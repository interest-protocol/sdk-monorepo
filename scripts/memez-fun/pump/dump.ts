import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { pumpSdk, executeTx, testnetPoolId, keypair } = await getEnv();

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const memeCoin = coinWithBalance({
    balance: 100n,
    type: pool.memeCoinType,
  })(tx);

  const { quoteCoin, tx: tx2 } = await pumpSdk.dump({
    pool: testnetPoolId,
    memeCoin,
    tx,
    referrer:
      '0x894261575b948c035d002adc3ca4d73c683c01a1bfafac183870940bf9afef1a',
  });

  tx2.transferObjects([quoteCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
