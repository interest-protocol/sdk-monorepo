import { getEnv } from '../utils.script';

const TOKEN_ID = '';

(async () => {
  const { stableSdk, executeTx, keypair, testnetStablePoolId } = await getEnv();

  const { memeCoin, tx } = await stableSdk.toCoin({
    pool: testnetStablePoolId,
    memeToken: TOKEN_ID,
  });

  tx.transferObjects([memeCoin], tx.pure.address(keypair.toSuiAddress()));

  await executeTx(tx);
})();
