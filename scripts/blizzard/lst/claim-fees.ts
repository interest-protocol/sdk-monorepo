import { OWNED_OBJECTS, SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { executeTx, keypair } from '@interest-protocol/sui-utils';
import invariant from 'tiny-invariant';

import { blizzardSDK, wwalAcl } from '../utils.script';

(async () => {
  const { tx, returnValues } = await wwalAcl.signIn({
    admin: OWNED_OBJECTS.WWAL_ADMIN,
  });

  const {
    returnValues: [wal, lst],
  } = await blizzardSDK.claimFees({
    tx,
    adminWitness: returnValues,
    blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({
      mutable: true,
    }).objectId,
  });

  invariant(lst, 'lst is required');
  invariant(wal, 'wal is required');

  tx.transferObjects([lst, wal], keypair.toSuiAddress());

  await executeTx(tx);
})();
