import {
  OWNED_OBJECTS,
  SHARED_OBJECTS,
  TYPES,
} from '@interest-protocol/blizzard-sdk';
import { executeTx, suiClient } from '@interest-protocol/sui-utils';
import { logSuccess } from '@interest-protocol/logger';

import { blizzardAcl, blizzardSDK, wwalAcl } from '../utils.script';

(async () => {
  const { tx, returnValues } = await wwalAcl.signIn({
    admin: OWNED_OBJECTS.WWAL_ADMIN,
  });

  await blizzardSDK.updateIconUrl({
    tx,
    value: 'https://api.interestlabs.io/files/w-wal-147x147.png',
    adminWitness: returnValues,
    blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({
      mutable: true,
    }).objectId,
  });

  await executeTx(tx as any);

  logSuccess(
    await suiClient.getCoinMetadata({
      coinType: TYPES.WWAL,
    })
  );
})();
