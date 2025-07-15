import { getEnv } from '../utils.script';

(async () => {
  const {
    aclSdk,
    configSdk,
    executeTx,
    ownedObjects,
    configKeys,
    xPumpMigratorSdk,
  } = await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const tx2 = configSdk.addMigrationWitness({
    authWitness,
    configKey: configKeys.XPUMP,
    migratorWitness: xPumpMigratorSdk.witness,
    tx: tx as any,
  });

  await executeTx(tx2);
})();
