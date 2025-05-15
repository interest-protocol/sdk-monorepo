import { Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { pumpSdk, executeTx, testnetPoolId, keypair } = await getEnv();

  const { quoteCoin, tx: tx2 } = await pumpSdk.dumpToken({
    pool: testnetPoolId,
    memeToken:
      '0x0e7ff43271a5e8bd96cfc0907b514490cc9a22cfca9d9029bd16d5669ce6800a',
    tx,
  });

  tx2.transferObjects([quoteCoin], tx.pure.address(keypair.toSuiAddress()));

  await executeTx(tx2);
})();
