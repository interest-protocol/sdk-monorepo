import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const { stableSdk, executeTx, keypair, testnetStablePoolId, POW_10_9 } =
    await getEnv();

  const tx = new Transaction();

  const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(5n * POW_10_9)]);

  const {
    memeCoin,
    excessQuoteCoin,
    tx: tx2,
  } = await stableSdk.pump({
    pool: testnetStablePoolId,
    quoteCoin,
    tx,
  });

  invariant(excessQuoteCoin, 'No excess quote coin');
  invariant(memeCoin, 'No meme coin');

  tx2.transferObjects([memeCoin, excessQuoteCoin], keypair.toSuiAddress());

  await executeTx(tx2);
})();
