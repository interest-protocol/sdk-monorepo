import { getEnv } from '../utils.script';

(async () => {
  const {
    farmsSdk,
    fakeSuiTypeArg,
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
    rewardType: fakeSuiTypeArg,
    endTime: new Date().getTime() + 604800000,
    adminWitness: authWitness,
  });

  await executeTx(tx2);
})();
