import { getEnv } from '../utils.script';

(async () => {
  const {
    aclSdk,
    configSdk,
    executeTx,
    migratorWitnesses,
    ownedObjects,
    configKeys,
  } = await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const tx2 = configSdk.addMigrationWitness({
    authWitness,
    configKey: configKeys.MEMEZ,
    migratorWitness: migratorWitnesses.TEST,
    tx,
  });

  await executeTx(tx2);
})();
