import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, executeTx, testnetPoolId } = await getEnv();

  const { tx } = await pumpSdk.distributeStakeHoldersAllocation({
    pool: testnetPoolId,
  });

  await executeTx(tx);
})();
