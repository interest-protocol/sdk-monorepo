import { getEnv } from '../utils.script';

(async () => {
  const { aclSdk, executeTx, ownedObjects, keypair } = await getEnv();

  const tx = aclSdk.newAdminAndTransfer({
    superAdmin: ownedObjects.MEMEZ_SUPER_ADMIN,
    recipient: keypair.toSuiAddress(),
  });

  await executeTx(tx);
})();
