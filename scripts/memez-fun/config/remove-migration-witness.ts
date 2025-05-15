import { getEnv } from '../utils.script';

(async () => {
  const {
    aclSdk,
    configSdk,
    executeTx,
    ownedObjects,
    configKeys,
    migratorWitnesses,
  } = await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const tx2 = configSdk.removeMigrationWitness({
    authWitness,
    configKey: configKeys.MEMEZ,
    migratorWitness: migratorWitnesses.TEST,
    tx,
  });

  await executeTx(tx2);
})();
