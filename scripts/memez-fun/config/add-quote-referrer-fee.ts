import { getEnv } from '../utils.script';

(async () => {
  const { aclSdk, configSdk, executeTx, ownedObjects, configKeys } =
    await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const tx2 = configSdk.setQuoteReferrerFee({
    authWitness,
    configKey: configKeys.XPUMP,
    fee: 10,
    tx: tx as any,
  });

  await executeTx(tx2);
})();
