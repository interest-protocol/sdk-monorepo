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
    configKey: configKeys.XPUMP,
    migratorWitness:
      'b9b3b4723d4a308d72e1fafb0c35cd14d235075c6552a663a43daf077a508f98::xpump_migrator::Witness',
    tx: tx as any,
  });

  await executeTx(tx2);
})();
