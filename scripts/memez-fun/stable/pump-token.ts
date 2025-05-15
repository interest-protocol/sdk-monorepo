import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { stableSdk, executeTx, keypair, testnetStablePoolId, POW_10_9 } =
    await getEnv();

  const quoteCoin = tx.splitCoins(tx.gas, [tx.pure.u64(10n * POW_10_9)]);

  const {
    memeToken,
    tx: tx2,
    excessQuoteCoin,
  } = await stableSdk.pumpToken({
    pool: testnetStablePoolId,
    quoteCoin,
    tx,
  });

  invariant(excessQuoteCoin, 'No excess quote coin');
  invariant(memeToken, 'No meme token');

  tx2.transferObjects(
    [excessQuoteCoin],
    tx2.pure.address(keypair.toSuiAddress())
  );

  const pool = await stableSdk.getStablePool(testnetStablePoolId);

  const { tx: tx3 } = await stableSdk.keepToken({
    token: memeToken,
    tx: tx2,
    memeCoinType: pool.memeCoinType,
  });

  await executeTx(tx3);
})();
