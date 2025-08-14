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
    quoteCoinType:
      '0xfd35b96db6d0eb23b8dc4eae97d330d8de85d36ee6a9ab0b35dcb2b7b86cd22a::fake_sui::FAKE_SUI',
    tx: tx as any,
  });

  await executeTx(tx2);
})();
