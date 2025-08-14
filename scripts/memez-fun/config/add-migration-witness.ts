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
    configKey: configKeys.MEMEZ,
    migratorWitness:
      '0xcd8766f0e879a4b5d1c2b0903765b2064d366e805267145ae7ba48d0064d9be6::xpump_migrator::Witness',
    tx: tx as any,
  });

  await executeTx(tx2);
})();
