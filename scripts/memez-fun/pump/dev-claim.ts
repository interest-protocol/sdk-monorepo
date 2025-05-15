import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, executeTx, testnetPoolId, keypair } = await getEnv();

  const { memeCoin, tx } = await pumpSdk.devClaim({
    pool: testnetPoolId,
  });

  tx.transferObjects([memeCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
