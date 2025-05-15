import {
  OWNED_OBJECTS,
  POOLS,
} from '@interest-protocol/interest-stable-swap-sdk';
import { executeTx } from '@interest-protocol/sui-utils';

import { acl, stableSwapSDK } from '../utils.script';

(async () => {
  const { tx, returnValues: adminWitness } = await acl.signIn({
    admin: OWNED_OBJECTS.ADMIN,
  });

  await stableSwapSDK.updateFees({
    tx,
    pool: POOLS.WAL_WWAL.objectId,
    adminWitness,
  });

  await executeTx(tx);
})();
