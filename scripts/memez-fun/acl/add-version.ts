import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { ownedObjects, sharedObjects, packages, aclSdk, executeTx } =
    await getEnv();

  const { tx, authWitness } = await aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  tx.moveCall({
    package: packages.MEMEZ_FUN.latest,
    module: 'memez_allowed_versions',
    function: 'add',
    arguments: [
      tx.sharedObjectRef(sharedObjects.VERSION({ mutable: true })),
      authWitness,
      tx.pure.u64(3),
    ],
  });

  await executeTx(tx as any);
})();
