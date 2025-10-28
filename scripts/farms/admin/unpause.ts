import { getEnv } from '../utils.script';

(async () => {
  const { farmsSdk, aclSdk, memezOwnedObjects, executeTx, farmId } =
    await getEnv();

  const { tx, authWitness } = await aclSdk.signIn({
    admin: memezOwnedObjects.ADMIN,
  });

  const { tx: tx2 } = await farmsSdk.unpause({
    tx: tx as any,
    farm: farmId,
    adminWitness: authWitness,
  });

  await executeTx(tx2);
})();
