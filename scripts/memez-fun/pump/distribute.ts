import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, executeTx, testnetPoolId } = await getEnv();

  const { tx } = await pumpSdk.distributeStakeHoldersAllocation({
    pool: '0x5ef33206085ac3d53daa334989a38a86c8521a22e50b53cbb980318137baca70',
  });

  await executeTx(tx);
})();
