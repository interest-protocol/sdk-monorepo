import { getEnv } from '../utils.script';

(async () => {
  const {
    farmsSdk,
    manifestType,
    aclSdk,
    memezOwnedObjects,
    executeTx,
    farmId,
    pow9,
  } = await getEnv();

  const { tx, authWitness } = await aclSdk.signIn({
    admin: memezOwnedObjects.ADMIN,
  });

  const oneWeekInSeconds = 604800n;

  const { tx: tx2 } = await farmsSdk.setRewardsPerSecond({
    tx: tx as any,
    farm: farmId,
    rewardType: manifestType,
    rewardsPerSecond: 3417506200n,
    adminWitness: authWitness,
  });

  await executeTx(tx2);
})();
