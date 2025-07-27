import { fromHex } from '@mysten/sui/utils';

import { getEnv } from '../utils.script';

(async () => {
  const { aclSdk, configSdk, executeTx, ownedObjects, configKeys } =
    await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const tx2 = configSdk.setPublicKey({
    authWitness,
    configKey: configKeys.XPUMP,
    publicKey: fromHex(
      'ab7f2bc0aeacffff8dda5b77c6e912ce229e8f1dab303bd6191dda214c1b647c'
    ),
    tx: tx as any,
  });

  await executeTx(tx2);
})();
