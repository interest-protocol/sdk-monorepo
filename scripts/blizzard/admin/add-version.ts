import { OWNED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { executeTx } from '@interest-protocol/sui-utils';

import { blizzardAcl, blizzardSDK } from '../utils.script';

(async () => {
  const { tx, returnValues } = await blizzardAcl.signIn({
    admin: OWNED_OBJECTS.BLIZZARD_ADMIN,
  });

  await blizzardSDK.addVersion({
    tx,
    version: 2,
    adminWitness: returnValues,
  });

  await executeTx(tx);
})();
