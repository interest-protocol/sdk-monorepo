import { getEnv } from '../utils.script';

(async () => {
  const {
    farmsSdk,
    aclSdk,
    memezOwnedObjects,
    executeTx,
    farmId,
    manifestType,
  } = await getEnv();

  const { tx, authWitness } = await aclSdk.signIn({
    admin: memezOwnedObjects.ADMIN,
  });

  const currenTimeInSeconds = Math.floor(new Date().getTime() / 1000);

  const twoWeeksInSeconds = 1209600;
  const oneWeekInSeconds = 604800;
  const fourWeeksInSeconds = 2419200;

  const { tx: tx2 } = await farmsSdk.setEndTime({
    tx: tx as any,
    farm: farmId,
    rewardType: manifestType,
    endTime: currenTimeInSeconds + twoWeeksInSeconds,
    adminWitness: authWitness,
  });

  await executeTx(tx2);
})();
