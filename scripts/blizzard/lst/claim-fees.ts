import { OWNED_OBJECTS, SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { executeTx, keypair } from '@interest-protocol/utils';

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

  tx.transferObjects([lst, wal], keypair.toSuiAddress());

  await executeTx(tx);
})();
