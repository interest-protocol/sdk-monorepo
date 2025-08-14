import { SUI_TYPE_ARG } from '@mysten/sui/utils';

import { getEnv } from '../utils.script';

(async () => {
  const { aclSdk, configSdk, executeTx, ownedObjects, configKeys } =
    await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const tx2 = configSdk.removeQuoteCoin({
    authWitness,
    configKey: configKeys.MEMEZ,
    quoteCoinType:
      '0x8a483be613e5ab107256a1a88cfd539d6224ba8b8524a11da31a5d47071916ea::fake_sui::FAKE_SUI',
    tx: tx as any,
  });

  await executeTx(tx2);
})();
