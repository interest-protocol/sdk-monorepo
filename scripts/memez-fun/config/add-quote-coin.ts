import { SUI_TYPE_ARG } from '@mysten/sui/utils';

import { getEnv } from '../utils.script';

(async () => {
  const { aclSdk, configSdk, executeTx, ownedObjects, configKeys } =
    await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const tx2 = configSdk.addQuoteCoin({
    authWitness,
    configKey: configKeys.MEMEZ,
    quoteCoinType: SUI_TYPE_ARG,
    tx,
  });

  await executeTx(tx2);
})();
