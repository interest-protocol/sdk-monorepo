import { getEnv } from '../utils.script';

(async () => {
  const {
    farmsSdk,
    fakeSuiTypeArg,
    aclSdk,
    memezOwnedObjects,
    executeTx,
    farmId,
    pow9,
  } = await getEnv();

  const { tx, authWitness } = await aclSdk.signIn({
    admin: memezOwnedObjects.ADMIN,
  });

  console.log((16n * pow9) / 604800n);

  const { tx: tx2 } = await farmsSdk.setRewardsPerSecond({
    tx: tx as any,
    farmId,
    rewardType: fakeSuiTypeArg,
    rewardsPerSecond: (3_000n * pow9) / 604800n,
    adminWitness: authWitness,
  });

  await executeTx(tx2);
})();
