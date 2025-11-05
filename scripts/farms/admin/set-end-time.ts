import { getEnv } from '../utils.script';

(async () => {
  const {
    farmsSdk,
    manifestType,
    aclSdk,
    memezOwnedObjects,
    executeTx,
    farmId,
  } = await getEnv();

  const { tx, authWitness } = await aclSdk.signIn({
    admin: memezOwnedObjects.ADMIN,
  });

  const { tx: tx2 } = await farmsSdk.setEndTime({
    tx: tx as any,
    farm: farmId,
    rewardType: manifestType,
    endTime: new Date().getTime() + 1209600,
    adminWitness: authWitness,
  });

  await executeTx(tx2);
})();
