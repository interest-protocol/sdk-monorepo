import { getEnv } from '../utils.script';

(async () => {
  const { stableSdk, executeTx, testnetStablePoolId } = await getEnv();

  const { tx } = await stableSdk.distributeStakeHoldersAllocation({
    pool: testnetStablePoolId,
  });

  await executeTx(tx);
})();
