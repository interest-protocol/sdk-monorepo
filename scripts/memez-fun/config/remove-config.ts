import { getEnv } from '../utils.script';

(async () => {
  const {
    aclSdk,
    configSdk,
    executeTx,
    ownedObjects,
    configKeys,
    types,
    packages,
  } = await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const tx2 = configSdk.removeConfiguration({
    authWitness,
    key: `${packages.MEMEZ_FUN.original}::memez_config::FeesKey<${configKeys.MEMEZ}>`,
    model: types.MEMEZ_FEE,
    tx,
  });

  await executeTx(tx2);
})();
