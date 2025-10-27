import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { pumpSdk, executeTx, testnetPoolId, keypair, pow9, fakeSuiTypeArg } =
    await getEnv();

  const quoteCoin = coinWithBalance({
    balance: 2550n * pow9,
    type: fakeSuiTypeArg,
  });

  const { memeCoin, tx: tx2 } = await pumpSdk.pump({
    pool: testnetPoolId,
    quoteCoin,
    tx,
  });

  tx2.transferObjects([memeCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
