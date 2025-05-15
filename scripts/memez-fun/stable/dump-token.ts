import { Transaction } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { stableSdk, executeTx, testnetStablePoolId, keypair } = await getEnv();

  const { quoteCoin, tx: tx2 } = await stableSdk.dumpToken({
    pool: testnetStablePoolId,
    memeToken: '',
    tx,
  });

  tx2.transferObjects([quoteCoin], tx.pure.address(keypair.toSuiAddress()));

  await executeTx(tx2);
})();
