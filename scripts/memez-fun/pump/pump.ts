import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { pumpSdk, executeTx, testnetPoolId, keypair } = await getEnv();

  const quoteCoin = coinWithBalance({
    balance: 100,
    type: '0x2::sui::SUI',
  });

  const { memeCoin, tx: tx2 } = await pumpSdk.pump({
    pool: testnetPoolId,
    quoteCoin,
    tx,
  });

  tx2.transferObjects([memeCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
