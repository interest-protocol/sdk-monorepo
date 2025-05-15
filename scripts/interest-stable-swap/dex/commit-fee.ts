import {
  OWNED_OBJECTS,
  POOLS,
} from '@interest-protocol/interest-stable-swap-sdk';
import { executeTx } from '@interest-protocol/utils';

import { acl, stableSwapSDK } from '../utils.script';

(async () => {
  const { tx, returnValues: adminWitness } = await acl.signIn({
    admin: OWNED_OBJECTS.ADMIN,
  });

  await stableSwapSDK.commitFees({
    tx,
    pool: POOLS.WAL_WWAL.objectId,
    fee: 1000000000000000n,
    adminFee: 200000000000000000n,
    adminWitness,
  });

  await executeTx(tx);
})();
