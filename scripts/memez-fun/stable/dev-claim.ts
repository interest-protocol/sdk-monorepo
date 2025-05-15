import { getEnv } from '../utils.script';

(async () => {
  const { stableSdk, executeTx, testnetStablePoolId, keypair } = await getEnv();

  const { memezVesting, tx } = await stableSdk.developerAllocationClaim({
    pool: testnetStablePoolId,
  });

  tx.transferObjects([memezVesting], keypair.toSuiAddress());

  await executeTx(tx);
})();
